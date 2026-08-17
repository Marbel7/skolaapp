/* TaskEngine — SkolaApp
 * Firestore is the single source of truth for tasks.
 * One snapshot listener, one renderer, no task localStorage fallback.
 */
(function () {
  'use strict';

  if (window.TaskEngine) {
    console.warn('[TaskEngine] already initialized');
    return;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
  }

  var TaskEngine = {
    state: [],
    _unsub: null,
    _col: null,
    _uid: null,
    _expanded: false,

    init: function (uid) {
      if (!uid) return;
      if (this._unsub) this._unsub();
      this._unsub = null;
      this._uid = uid;

      var firebaseRef = window.firebase;
      if (!firebaseRef || typeof firebaseRef.firestore !== 'function') {
        console.error('[TaskEngine] Firebase Firestore is unavailable');
        this.state = [];
        this.render();
        if (window.showToast) window.showToast('⚠️ Firebase Firestore není dostupný');
        return;
      }

      try {
        this._col = firebaseRef.firestore()
          .collection('users').doc(uid).collection('tasks');
      } catch (err) {
        console.error('[TaskEngine] Firestore init error:', err);
        this._col = null;
        this.state = [];
        this.render();
        if (window.showToast) window.showToast('⚠️ Nepodařilo se připojit k úkolům');
        return;
      }

      var self = this;
      this._unsub = this._col.orderBy('createdAt', 'desc').onSnapshot(function (snap) {
        self.state = snap.docs.map(function (d) {
          var data = d.data() || {};
          return {
            id: d.id,
            text: data.text || '',
            done: !!data.done,
            priority: data.priority || 'med',
            createdAt: data.createdAt || new Date().toISOString()
          };
        });
        self._syncLegacyReaders();
        self.render();
      }, function (err) {
        console.error('[TaskEngine] onSnapshot error:', err.code, err.message);
        self.state = [];
        self._syncLegacyReaders();
        self.render();
        if (window.showToast) window.showToast('⚠️ Nepodařilo se načíst úkoly: ' + (err.code || 'chyba'));
      });

      console.log('[TaskEngine] init: uid=' + String(uid).slice(0, 8) + '…');
    },

    destroy: function () {
      if (this._unsub) this._unsub();
      this._unsub = null;
      this._col = null;
      this._uid = null;
      this.state = [];
      this._syncLegacyReaders();
      this.render();
    },

    _syncLegacyReaders: function () {
      try { window.tasks = this.state; } catch (e) {}
    },

    render: function () {
      var list = document.getElementById('taskList');
      if (!list) return;

      var searchEl = document.getElementById('taskSearch');
      var query = searchEl ? String(searchEl.value || '').trim().toLowerCase() : '';
      var filtered = this.state.filter(function (t) {
        return !query || String(t.text || '').toLowerCase().indexOf(query) >= 0;
      });

      var done = this.state.filter(function (t) { return t.done; }).length;
      var total = this.state.length;
      var doneEl = document.getElementById('doneCount');
      var badgeEl = document.getElementById('taskBadge');
      if (doneEl) doneEl.textContent = done + ' / ' + total;
      if (badgeEl) badgeEl.textContent = total + ' úkol' + (total === 1 ? '' : 'ů');

      if (!filtered.length) {
        list.innerHTML = '<li class="tempty">' +
          (query ? 'Žádné úkoly odpovídají filtru.' : 'Žádné úkoly — skvělé! 🎉') + '</li>';
        this._updateAccordionSummary();
        this._applyAccordionState();
        return;
      }

      list.innerHTML = filtered.map(function (t) {
        var label = t.priority === 'high' ? 'Vysoká' : t.priority === 'low' ? 'Nízká' : 'Střední';
        var cls = t.priority === 'high' ? 'ph' : t.priority === 'low' ? 'pl' : 'pm';
        return '<li class="titem' + (t.done ? ' done' : '') + '" data-id="' + esc(t.id) + '">' +
          '<button type="button" class="tck' + (t.done ? ' checked' : '') + '"' +
          ' data-te-action="toggle" data-te-id="' + esc(t.id) + '" aria-pressed="' + (t.done ? 'true' : 'false') + '">' +
          '</button>' +
          '<span class="ttxt">' + esc(t.text) + '</span>' +
          '<span class="tprio ' + cls + '">' + label + '</span>' +
          '<button type="button" class="tdel" data-te-action="delete" data-te-id="' + esc(t.id) + '">✕</button>' +
          '</li>';
      }).join('');

      this._updateAccordionSummary();
      this._applyAccordionState();
    },

    add: function (text, priority) {
      if (!text || !this._col) return;
      var self = this;
      var now = new Date().toISOString();
      var optimistic = { id: '__tmp_' + Date.now(), text: text, done: false, priority: priority || 'med', createdAt: now };
      this.state.unshift(optimistic);
      this._syncLegacyReaders();
      this.render();

      this._col.add({ text: text, done: false, priority: priority || 'med', createdAt: now })
        .catch(function (err) {
          console.error('[TaskEngine] add error:', err);
          self.state = self.state.filter(function (t) { return t.id !== optimistic.id; });
          self._syncLegacyReaders();
          self.render();
          if (window.showToast) window.showToast('⚠️ Nepodařilo se přidat úkol: ' + err.message);
        });
    },

    toggle: function (id) {
      var task = this.state.find(function (t) { return t.id === id; });
      if (!task || !this._col || String(id).indexOf('__tmp_') === 0) return;
      var self = this;
      var newDone = !task.done;
      task.done = newDone;
      this._syncLegacyReaders();
      this.render();
      this._col.doc(id).update({ done: newDone }).catch(function (err) {
        console.error('[TaskEngine] toggle error:', err);
        var t2 = self.state.find(function (t) { return t.id === id; });
        if (t2) t2.done = !newDone;
        self._syncLegacyReaders();
        self.render();
        if (window.showToast) window.showToast('⚠️ Nepodařilo se uložit změnu');
      });
    },

    delete: function (id) {
      if (!id) return;
      var removed = null;
      var self = this;
      this.state = this.state.filter(function (t) {
        if (t.id === id) { removed = t; return false; }
        return true;
      });
      this._syncLegacyReaders();
      this.render();
      if (!this._col || String(id).indexOf('__tmp_') === 0) return;

      this._col.doc(id).delete().catch(function (err) {
        console.error('[TaskEngine] delete error:', err);
        if (removed) self.state.push(removed);
        self.state.sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); });
        self._syncLegacyReaders();
        self.render();
        if (window.showToast) window.showToast('⚠️ Nepodařilo se smazat úkol');
      });
    },

    _buildAccordion: function () {
      var list = document.getElementById('taskList');
      var card = list && list.closest('.card');
      if (!card || card.dataset.teAcc === '1') return;
      var head = card.querySelector('.card-hd');
      if (!head) return;
      card.dataset.teAcc = '1';
      card.classList.add('te-task-card');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'te-acc-btn';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span class="te-acc-copy">' +
        '<span class="te-acc-title">Úkoly</span>' +
        '<span class="te-acc-val"><strong id="teTaskDone">0</strong> / <span id="teTaskTotal">0</span> splněno</span>' +
        '<span class="te-acc-prog"><span id="teTaskProg"></span></span>' +
        '<span class="te-acc-meta" id="teTaskMeta">Zatím žádné úkoly</span>' +
        '</span><span class="te-chev" aria-hidden="true">⌄</span>';
      head.replaceWith(btn);
      this._expanded = false;
      this._applyAccordionState();
    },

    _applyAccordionState: function () {
      var list = document.getElementById('taskList');
      var card = list && list.closest('.card');
      var btn = card && card.querySelector('.te-acc-btn');
      if (!card) return;
      card.classList.toggle('te-expanded', !!this._expanded);
      card.classList.toggle('te-collapsed', !this._expanded);
      if (btn) {
        btn.setAttribute('aria-expanded', this._expanded ? 'true' : 'false');
        var chev = btn.querySelector('.te-chev');
        if (chev) chev.textContent = this._expanded ? '⌃' : '⌄';
      }
    },

    _updateAccordionSummary: function () {
      var done = this.state.filter(function (t) { return t.done; }).length;
      var total = this.state.length;
      var d = document.getElementById('teTaskDone');
      var t = document.getElementById('teTaskTotal');
      var p = document.getElementById('teTaskProg');
      var m = document.getElementById('teTaskMeta');
      if (d) d.textContent = done;
      if (t) t.textContent = total;
      if (p) p.style.width = (total ? Math.round(done / total * 100) : 0) + '%';
      if (m) m.textContent = total ? ((total - done) + ' zbývá') : 'Zatím žádné úkoly';
    },

    _patchLegacyCalendar: function () {
      if (typeof window.calGetTasksForDay !== 'function') return;
      window.calGetTasksForDay = function (dateStr) {
        return TaskEngine.state.filter(function (task) {
          if (!task.createdAt) return false;
          return new Date(task.createdAt).toLocaleDateString('cs-CZ') === dateStr;
        });
      };
    }
  };

  function installCSS() {
    if (document.getElementById('te-css')) return;
    var s = document.createElement('style');
    s.id = 'te-css';
    s.textContent = [
      '.te-acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0;margin:0 0 1rem;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none}',
      '.te-acc-copy{display:flex;flex:1;min-width:0;flex-direction:column}',
      '.te-acc-title{font-size:13px;font-weight:700;color:var(--ink)}',
      '.te-acc-val{font-size:12px;font-weight:600;color:var(--ink2);margin-top:3px}',
      '.te-acc-prog{width:min(180px,100%);height:5px;margin-top:6px;border-radius:999px;background:var(--surface3,#EDEDF3);overflow:hidden}',
      '.te-acc-prog>span{display:block;height:100%;border-radius:inherit;background:var(--primary,#6C5CE7);transition:width .2s}',
      '.te-acc-meta{font-size:11px;color:var(--ink3);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.te-chev{width:32px;height:32px;flex-shrink:0;display:grid;place-items:center;border:1px solid var(--border,#E8E8F0);border-radius:50%;background:var(--surface2,#F4F4F8);color:var(--ink2);font-size:16px;line-height:1;pointer-events:none}',
      '.te-task-card.te-collapsed .toolbar-row,.te-task-card.te-collapsed .ti-row,.te-task-card.te-collapsed #taskList{display:none!important}',
      '.te-task-card.te-expanded .toolbar-row{display:flex!important}',
      '.tck{-webkit-appearance:none!important;appearance:none!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;cursor:pointer!important;position:relative!important;overflow:visible!important;display:inline-flex!important;align-items:center!important;justify-content:center!important}',
      '.tck.checked{background:var(--primary,#6C5CE7)!important;border-color:var(--primary,#6C5CE7)!important;color:#fff!important;font-size:0!important;font-weight:800!important}',
      '.tck.checked::after{content:"✓"!important;display:block!important;font-size:12px!important;line-height:1!important;color:#fff!important}',
      '.tck:not(.checked)::after{content:none!important}',
      '.tdel{touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;cursor:pointer!important;min-width:36px!important;min-height:36px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important}',
      '@media(max-width:700px){.te-task-card.te-expanded #taskList{max-height:min(45vh,380px)!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important}}'
    ].join('');
    document.head.appendChild(s);
  }

  function installHandlers() {
    if (document.__taskEngineHandlersInstalled) return;
    document.__taskEngineHandlersInstalled = true;

    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('.te-acc-btn') : null;
      if (!btn) return;
      TaskEngine._expanded = !TaskEngine._expanded;
      TaskEngine._applyAccordionState();
      e.preventDefault();
      e.stopPropagation();
    }, false);

    document.addEventListener('click', function (e) {
      var el = e.target && e.target.closest ? e.target.closest('[data-te-action]') : null;
      if (!el) return;
      var action = el.getAttribute('data-te-action');
      var id = el.getAttribute('data-te-id');
      if (!action || !id) return;
      e.preventDefault();
      e.stopPropagation();
      if (action === 'toggle') TaskEngine.toggle(id);
      else if (action === 'delete') TaskEngine.delete(id);
    }, false);

    function addTask() {
      var inp = document.getElementById('taskInput');
      var pri = document.getElementById('taskPriority');
      if (!inp) return;
      var text = inp.value.trim();
      if (!text) return;
      inp.value = '';
      inp.focus();
      if (!TaskEngine._expanded) {
        TaskEngine._expanded = true;
        TaskEngine._applyAccordionState();
      }
      TaskEngine.add(text, pri ? pri.value : 'med');
    }

    var addBtn = document.getElementById('taskAddBtn');
    var input = document.getElementById('taskInput');
    if (addBtn) addBtn.addEventListener('click', addTask);
    if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') addTask(); });

    var search = document.getElementById('taskSearch');
    if (search) search.addEventListener('input', function () { TaskEngine.render(); });
  }

  function init() {
    installCSS();
    TaskEngine._buildAccordion();
    TaskEngine._patchLegacyCalendar();
    installHandlers();
    TaskEngine._syncLegacyReaders();
    TaskEngine.render();
    console.log('[TaskEngine] ready — čeká na auth');
  }

  window.TaskEngine = TaskEngine;
  window._teEsc = esc;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();