/* ═══════════════════════════════════════════════════════════════════════
   TaskEngine — SkolaApp
   Verze: 1.0  (čistý přepis, žádné záplaty)

   ARCHITEKTURA:
     Firestore onSnapshot → TaskEngine.state → TaskEngine.render() → UI
     UI akce → TaskEngine.add/toggle/delete → Firestore → onSnapshot → ...

   PRAVIDLA:
   • TaskEngine je JEDINÝ vlastník task state.
   • TaskEngine.render() je JEDINÉ místo, které zapisuje do #taskList DOM.
   • Žádný localStorage pro tasks — Firestore je jediný zdroj pravdy.
   • Žádný druhý onSnapshot, žádný fbLoadAll pro tasks.
   • Žádný TIF hook na renderTasks — accordion zde pracuje přímo s enginem.
   • Optimistic update: při konfliktu vždy vyhraje server (onSnapshot).
═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Zabraň dvojité inicializaci ─────────────────────────────────── */
  if (window.TaskEngine) {
    console.warn('[TaskEngine] Již inicializován — přeskočeno.');
    return;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK ENGINE — core
  ══════════════════════════════════════════════════════════════════ */
  var TaskEngine = {

    /* Jediný zdroj pravdy */
    state: [],

    /* Firestore unsubscribe fn */
    _unsub: null,

    /* Firestore kolekce ref */
    _col: null,

    /* Accordion stav */
    _expanded: false,

    /* ── init ────────────────────────────────────────────────────────
     * Volá se z onAuthStateChanged po přihlášení.
     * Naváže jediný Firestore onSnapshot listener.
     ─────────────────────────────────────────────────────────────── */
    init: function (uid) {
      if (this._unsub) this._unsub(); /* zruš starý listener pokud existuje */
      this._col = window.db
        .collection('users')
        .doc(uid)
        .collection('tasks');

      var self = this;
      this._unsub = this._col
        .orderBy('createdAt', 'desc')
        .onSnapshot(
          function (snap) {
            /* Server je autoritativní — přepíše vždy celý state */
            self.state = snap.docs.map(function (d) {
              var data = d.data();
              return {
                id:        d.id,
                text:      data.text      || '',
                done:      !!data.done,
                priority:  data.priority  || 'med',
                createdAt: data.createdAt || new Date().toISOString()
              };
            });
            self.render();
          },
          function (err) {
            console.error('[TaskEngine] onSnapshot error:', err.code, err.message);
            /* Nezobrazuj localStorage fallback — ukáž prázdný stav + chybu */
            self.state = [];
            self.render();
            if (window.showToast) window.showToast('⚠️ Nepodařilo se načíst úkoly: ' + err.code);
          }
        );

      console.log('[TaskEngine] init: uid=' + uid.slice(0, 8) + '…');
    },

    /* ── destroy ─────────────────────────────────────────────────────
     * Volá se z onAuthStateChanged při odhlášení.
     ─────────────────────────────────────────────────────────────── */
    destroy: function () {
      if (this._unsub) { this._unsub(); this._unsub = null; }
      this._col   = null;
      this.state  = [];
      this._expanded = false;
      this.render();
      console.log('[TaskEngine] destroy');
    },

    /* ── render ──────────────────────────────────────────────────────
     * JEDINÉ místo, které zapisuje do #taskList.
     * Nikdo jiný nesmí měnit #taskList DOM.
     ─────────────────────────────────────────────────────────────── */
    render: function () {
      var list = document.getElementById('taskList');
      if (!list) return;

      var query = (document.getElementById('taskSearch') || {}).value || '';
      query = query.trim().toLowerCase();

      var filtered = this.state.filter(function (t) {
        return !query || t.text.toLowerCase().indexOf(query) >= 0;
      });

      /* Stat counters */
      var done  = this.state.filter(function (t) { return t.done; }).length;
      var total = this.state.length;
      var doneEl  = document.getElementById('doneCount');
      var badgeEl = document.getElementById('taskBadge');
      if (doneEl)  doneEl.textContent  = done + ' / ' + total;
      if (badgeEl) badgeEl.textContent = total + ' úkol' + (total === 1 ? '' : 'ů');

      /* Prázdný stav */
      if (!filtered.length) {
        list.innerHTML = '<li class="tempty">' +
          (query ? 'Žádné úkoly odpovídají filtru.' : 'Žádné úkoly — skvělé! 🎉') +
          '</li>';
        this._updateAccordionSummary();
        return;
      }

      /* Render položek */
      list.innerHTML = filtered.map(function (t) {
        var priLabel = t.priority === 'high' ? 'Vysoká'
                     : t.priority === 'low'  ? 'Nízká' : 'Střední';
        var priClass = t.priority === 'high' ? 'ph'
                     : t.priority === 'low'  ? 'pl' : 'pm';
        return '<li class="titem' + (t.done ? ' done' : '') + '" data-id="' + esc(t.id) + '">' +
          '<button type="button" class="tck' + (t.done ? ' checked' : '') + '"' +
            ' data-te-action="toggle" data-te-id="' + esc(t.id) + '"' +
            ' aria-pressed="' + (t.done ? 'true' : 'false') + '">' +
            (t.done ? '✓' : '') +
          '</button>' +
          '<span class="ttxt">' + esc(t.text) + '</span>' +
          '<span class="tprio ' + priClass + '">' + priLabel + '</span>' +
          '<button class="tdel" data-te-action="delete" data-te-id="' + esc(t.id) + '">✕</button>' +
          '</li>';
      }).join('');

      this._updateAccordionSummary();

      /* Obnov accordion CSS stav */
      this._applyAccordionState();
    },

    /* ── add ─────────────────────────────────────────────────────────
     * Přidá úkol. Optimistic update: vloží do state ihned, Firestore potvrdí.
     * onSnapshot přijde a přepíše state se správným id z Firestore.
     ─────────────────────────────────────────────────────────────── */
    add: function (text, priority) {
      if (!text || !this._col) return;
      var self = this;
      var now  = new Date().toISOString();

      /* Optimistic — dočasné ID */
      var tmpId = '__tmp_' + Date.now();
      var optimistic = { id: tmpId, text: text, done: false, priority: priority || 'med', createdAt: now };
      this.state.unshift(optimistic);
      this.render();

      /* Firestore zápis */
      var docData = { text: text, done: false, priority: priority || 'med', createdAt: now };
      this._col.add(docData)
        .then(function () {
          /* onSnapshot přijde a nahradí optimistic state serverovými daty */
        })
        .catch(function (err) {
          console.error('[TaskEngine] add error:', err);
          /* Odstraň optimistic záznam */
          self.state = self.state.filter(function (t) { return t.id !== tmpId; });
          self.render();
          if (window.showToast) window.showToast('⚠️ Nepodařilo se přidat úkol: ' + err.message);
        });
    },

    /* ── toggle ──────────────────────────────────────────────────────
     * Přepne done stav. Optimistic + Firestore.
     ─────────────────────────────────────────────────────────────── */
    toggle: function (id) {
      var task = this.state.find(function (t) { return t.id === id; });
      if (!task || !this._col) return;
      var self    = this;
      var newDone = !task.done;

      /* Optimistic */
      task.done = newDone;
      this.render();

      /* Firestore */
      this._col.doc(id).update({ done: newDone })
        .catch(function (err) {
          console.error('[TaskEngine] toggle error:', err);
          /* Rollback */
          var t2 = self.state.find(function (t) { return t.id === id; });
          if (t2) t2.done = !newDone;
          self.render();
          if (window.showToast) window.showToast('⚠️ Nepodařilo se uložit změnu');
        });
    },

    /* ── delete ──────────────────────────────────────────────────────
     * Smaže úkol. Optimistic + Firestore.
     ─────────────────────────────────────────────────────────────── */
    delete: function (id) {
      var removed = null;
      var self    = this;

      /* Optimistic */
      this.state = this.state.filter(function (t) {
        if (t.id === id) { removed = t; return false; }
        return true;
      });
      this.render();

      if (!this._col || !id) return;

      /* Firestore */
      this._col.doc(id).delete()
        .catch(function (err) {
          console.error('[TaskEngine] delete error:', err);
          /* Rollback */
          if (removed) {
            self.state.unshift(removed);
            self.state.sort(function (a, b) {
              return String(b.createdAt).localeCompare(String(a.createdAt));
            });
            self.render();
          }
          if (window.showToast) window.showToast('⚠️ Nepodařilo se smazat úkol');
        });
    },

    /* ══════════════════════════════════════════════════════════════
       ACCORDION — collapsible karta
    ══════════════════════════════════════════════════════════════ */

    _expanded: false,

    _buildAccordion: function () {
      var list = document.getElementById('taskList');
      var card = list && list.closest('.card');
      if (!card || card.dataset.teAcc === '1') return;
      var head = card.querySelector('.card-hd');
      if (!head) return;

      card.dataset.teAcc = '1';
      card.classList.add('te-task-card');

      var btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'te-acc-btn';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML =
        '<span class="te-acc-copy">' +
          '<span class="te-acc-title">Úkoly</span>' +
          '<span class="te-acc-val">' +
            '<strong id="teTaskDone">0</strong> / <span id="teTaskTotal">0</span> splněno' +
          '</span>' +
          '<span class="te-acc-prog"><span id="teTaskProg"></span></span>' +
          '<span class="te-acc-meta" id="teTaskMeta">Zatím žádné úkoly</span>' +
        '</span>' +
        '<span class="te-chev" aria-hidden="true">⌄</span>';
      head.replaceWith(btn);

      this._expanded = false;
      this._applyAccordionState();
    },

    _applyAccordionState: function () {
      var list = document.getElementById('taskList');
      var card = list && list.closest('.card');
      var btn  = card && card.querySelector('.te-acc-btn');
      if (!card) return;
      card.classList.toggle('te-expanded',  this._expanded);
      card.classList.toggle('te-collapsed', !this._expanded);
      if (btn) {
        btn.setAttribute('aria-expanded', this._expanded ? 'true' : 'false');
        var chev = btn.querySelector('.te-chev');
        if (chev) chev.textContent = this._expanded ? '⌃' : '⌄';
      }
    },

    _updateAccordionSummary: function () {
      var done  = this.state.filter(function (t) { return t.done; }).length;
      var total = this.state.length;
      var dEl = document.getElementById('teTaskDone');
      var tEl = document.getElementById('teTaskTotal');
      var pEl = document.getElementById('teTaskProg');
      var mEl = document.getElementById('teTaskMeta');
      if (dEl) dEl.textContent = done;
      if (tEl) tEl.textContent = total;
      if (pEl) pEl.style.width = (total ? Math.round(done / total * 100) : 0) + '%';
      if (mEl) mEl.textContent = total ? ((total - done) + ' zbývá') : 'Zatím žádné úkoly';
    }

  }; /* konec TaskEngine */

  /* ══════════════════════════════════════════════════════════════════
     CSS
  ══════════════════════════════════════════════════════════════════ */
  function installCSS() {
    if (document.getElementById('te-css')) return;
    var s = document.createElement('style');
    s.id  = 'te-css';
    s.textContent = [
      /* Accordion button */
      '.te-acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;',
        'gap:12px;padding:0;margin:0 0 1rem;border:0;background:transparent;',
        'color:inherit;font:inherit;text-align:left;cursor:pointer;',
        'touch-action:manipulation;-webkit-tap-highlight-color:transparent;',
        'user-select:none;-webkit-user-select:none;}',

      '.te-acc-copy{display:flex;flex:1;min-width:0;flex-direction:column;}',
      '.te-acc-title{font-size:13px;font-weight:700;color:var(--ink);}',
      '.te-acc-val{font-size:12px;font-weight:600;color:var(--ink2);margin-top:3px;}',
      '.te-acc-prog{width:min(180px,100%);height:5px;margin-top:6px;',
        'border-radius:999px;background:var(--surface3,#EDEDF3);overflow:hidden;}',
      '.te-acc-prog>span{display:block;height:100%;border-radius:inherit;',
        'background:var(--primary,#6C5CE7);transition:width .2s;}',
      '.te-acc-meta{font-size:11px;color:var(--ink3);margin-top:4px;',
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.te-chev{width:32px;height:32px;flex-shrink:0;display:grid;place-items:center;',
        'border:1px solid var(--border,#E8E8F0);border-radius:50%;',
        'background:var(--surface2,#F4F4F8);color:var(--ink2);',
        'font-size:16px;line-height:1;pointer-events:none;}',

      /* Collapsed */
      '.te-task-card.te-collapsed .toolbar-row,',
      '.te-task-card.te-collapsed .ti-row,',
      '.te-task-card.te-collapsed #taskList{display:none!important;}',

      /* Expanded toolbar */
      '.te-task-card.te-expanded .toolbar-row{display:flex!important;}',

      /* Checkbox — iOS fix */
      '.tck{-webkit-appearance:none!important;appearance:none!important;',
        'touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;',
        'cursor:pointer!important;position:relative!important;overflow:visible!important;',
        'display:inline-flex!important;align-items:center!important;justify-content:center!important;}',
      '.tck.checked{background:var(--primary,#6C5CE7)!important;',
        'border-color:var(--primary,#6C5CE7)!important;color:#fff!important;',
        'font-size:12px!important;font-weight:800!important;}',

      /* Delete button — touch target */
      '.tdel{touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;',
        'cursor:pointer!important;min-width:36px!important;min-height:36px!important;',
        'display:inline-flex!important;align-items:center!important;justify-content:center!important;}',

      /* Mobile */
      '@media(max-width:700px){',
        '.te-task-card.te-expanded #taskList{',
          'max-height:min(45vh,380px)!important;overflow-y:auto!important;',
          '-webkit-overflow-scrolling:touch!important;',
          'overscroll-behavior:contain!important;touch-action:pan-y!important;}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════════════════
     EVENT HANDLING — jeden místo, bubbling
  ══════════════════════════════════════════════════════════════════ */
  function installHandlers() {

    /* Accordion toggle */
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('.te-acc-btn') : null;
      if (!btn) return;
      TaskEngine._expanded = !TaskEngine._expanded;
      TaskEngine._applyAccordionState();
      e.preventDefault();
      e.stopPropagation();
    }, false);

    /* Task akce: toggle a delete — přes data-te-action atributy */
    document.addEventListener('click', function (e) {
      var el = e.target && e.target.closest ? e.target.closest('[data-te-action]') : null;
      if (!el) return;
      var action = el.getAttribute('data-te-action');
      var id     = el.getAttribute('data-te-id');
      if (!action || !id) return;
      e.preventDefault();
      e.stopPropagation();
      if (action === 'toggle') TaskEngine.toggle(id);
      if (action === 'delete') TaskEngine.delete(id);
    }, false);

    /* Add task — tlačítko + Enter */
    function addTask() {
      var inp = document.getElementById('taskInput');
      var pri = document.getElementById('taskPriority');
      if (!inp) return;
      var text = inp.value.trim();
      if (!text) return;
      inp.value = '';
      inp.focus();
      /* Otevři accordion pokud je zavřený */
      if (!TaskEngine._expanded) {
        TaskEngine._expanded = true;
        TaskEngine._applyAccordionState();
      }
      TaskEngine.add(text, pri ? pri.value : 'med');
    }

    var addBtn = document.getElementById('taskAddBtn');
    var taskInput = document.getElementById('taskInput');
    if (addBtn)    addBtn.addEventListener('click', addTask);
    if (taskInput) taskInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') addTask();
    });

    /* Search filter */
    var search = document.getElementById('taskSearch');
    if (search) search.addEventListener('input', function () {
      TaskEngine.render();
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     NAPOJENÍ NA EXISTUJÍCÍ AUTH SYSTÉM
     index.html volá fbSetupListeners() a fbLoadAll() po přihlášení.
     TaskEngine se naváže přes window.TaskEngine — onAuthStateChanged
     v index.html zavolá TaskEngine.init(uid) po přihlášení.
  ══════════════════════════════════════════════════════════════════ */

  /* Helper */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  /* Zpřístupni globálně pro render() */
  window._teEsc = esc;

  /* ── Inicializace při načtení stránky ──────────────────────────── */
  function init() {
    installCSS();
    TaskEngine._buildAccordion();
    installHandlers();
    console.log('[TaskEngine] ready — čeká na auth');
  }

  /* Exponuj globálně */
  window.TaskEngine = TaskEngine;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

})();
