/* task-interaction-fix.js — SkolaApp
 *
 * CO TENTO SOUBOR DĚLÁ:
 * 1. Přidá collapsible accordion na karty Úkoly a Poznámky
 * 2. Accordion stav (_state) je jediný zdroj pravdy — CSS nikdy neodporuje _state
 * 3. hookRenderTasks/hookRenderNotes zajistí že po každém renderTasks() / renderNotes()
 *    z index.html se stav accordionu okamžitě obnoví
 * 4. Click handler NESMÍ pohltit kliky na .tck, .tdel, #taskAddBtn ani ostatní
 *    interaktivní prvky — ty zpracovává index.html sám
 *
 * ARCHITEKTURA:
 * - index.html: taskList.addEventListener('click', handler, true) — capture phase
 * - TIF: document.addEventListener('click', handler, false) — bubbling phase
 * - Pořadí: capture (index.html) → target → bubbling (TIF accordion)
 * - TIF nikdy nevolá stopPropagation pro .tck/.tdel/[data-action]
 */
(function () {
  'use strict';

  /* Zabraň dvojité inicializaci */
  if (window.__SKOLA_TASK_FIX_V7__) {
    window.__SKOLA_TASK_FIX_V7__.reinit();
    return;
  }

  /* ── STAV ────────────────────────────────────────────────────────── */
  /* false = collapsed (výchozí), true = expanded */
  var _state = { taskList: false, notesList: false };

  /* ── POMOCNÉ FUNKCE ──────────────────────────────────────────────── */
  function getEl(id) { return document.getElementById(id); }

  /* ── APLIKACE STAVU NA DOM ──────────────────────────────────────────
   * JEDINÉ místo kde se mění CSS třídy is-expanded / is-collapsed.
   * Vždy čte z _state — nikdy z DOM.
   ─────────────────────────────────────────────────────────────────── */
  function applyState(listId) {
    var list = getEl(listId);
    if (!list) return;
    var card = list.closest('.card');
    if (!card) return;
    var expanded = !!_state[listId];
    card.classList.toggle('is-expanded',  expanded);
    card.classList.toggle('is-collapsed', !expanded);
    var btn = card.querySelector(listId === 'taskList' ? '.sk-acc-btn' : '.sk-acc-btn-n');
    if (btn) {
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      var chev = btn.querySelector('.sk-chev');
      if (chev) chev.textContent = expanded ? '⌃' : '⌄';
    }
  }

  /* ── SUMMARY REFRESH ────────────────────────────────────────────── */
  function refreshTaskSummary() {
    var src   = (Array.isArray(window.tasks) && window.tasks.length)
                ? window.tasks
                : (function(){ try{return JSON.parse(localStorage.getItem('zs_tasks_v3')||'[]');}catch(e){return[];} })();
    var done  = src.filter(function(t){ return !!t.done; }).length;
    var total = src.length;
    var doneEl = getEl('skTDone'), totEl = getEl('skTTotal');
    var progEl = getEl('skTProg'), metaEl = getEl('skTMeta');
    if (doneEl)  doneEl.textContent  = done;
    if (totEl)   totEl.textContent   = total;
    if (progEl)  progEl.style.width  = (total ? Math.round(done/total*100) : 0) + '%';
    if (metaEl)  metaEl.textContent  = total ? ((total-done) + ' zbývá') : 'Zatím žádné úkoly';
  }

  function refreshNotesSummary() {
    var src  = (Array.isArray(window.notes) && window.notes.length)
               ? window.notes
               : (function(){ try{return JSON.parse(localStorage.getItem('zs_notes_list_v1')||'[]');}catch(e){return[];} })();
    var cntEl  = getEl('skNCnt');
    var prevEl = getEl('skNPrev');
    if (cntEl)  cntEl.textContent  = src.length + ' uložených';
    if (prevEl) prevEl.textContent = (src[0] && src[0].text) ? String(src[0].text).trim().slice(0, 60) : 'Žádné poznámky';
  }

  /* ── HOOK renderTasks / renderNotes ─────────────────────────────────
   * Obalí originální funkci — po každém volání obnoví stav accordionu.
   * Eliminuje race condition kdy Firestore přepíše tasks[] a zavolá
   * renderTasks() aniž by TIF věděl.
   ─────────────────────────────────────────────────────────────────── */
  function hookRender(fnName, listId, summaryFn) {
    var orig = window[fnName];
    if (!orig || orig.__skHooked) return;
    window[fnName] = function() {
      orig.apply(this, arguments);
      /* Po renderu okamžitě obnov CSS stav z _state */
      applyState(listId);
      summaryFn();
    };
    window[fnName].__skHooked = true;
    window[fnName].__skOrig   = orig;
  }

  /* ── SESTAVENÍ ACCORDION BUTTONŮ ────────────────────────────────── */
  function makeTaskAccordion() {
    var list = getEl('taskList');
    var card = list && list.closest('.card');
    if (!card || card.dataset.skAcc === '1') return;
    var head = card.querySelector('.card-hd');
    if (!head) return;

    card.dataset.skAcc = '1';
    card.classList.add('sk-task-card');

    var btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'sk-acc-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML =
      '<span class="sk-acc-copy">' +
        '<span class="sk-acc-title">Úkoly</span>' +
        '<span class="sk-acc-val"><strong id="skTDone">0</strong> / <span id="skTTotal">0</span> splněno</span>' +
        '<span class="sk-acc-prog"><span id="skTProg"></span></span>' +
        '<span class="sk-acc-meta" id="skTMeta">Zatím žádné úkoly</span>' +
      '</span>' +
      '<span class="sk-chev" aria-hidden="true">⌄</span>';
    head.replaceWith(btn);

    _state.taskList = false;
    applyState('taskList');
    refreshTaskSummary();
  }

  function makeNotesAccordion() {
    var list = getEl('notesList');
    var card = list && list.closest('.card');
    if (!card || card.dataset.skAccN === '1') return;
    var head = card.querySelector('.card-hd');
    if (!head) return;

    card.dataset.skAccN = '1';
    card.classList.add('sk-notes-card');

    var btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'sk-acc-btn-n';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML =
      '<span class="sk-acc-copy">' +
        '<span class="sk-acc-title">✎ Poznámky</span>' +
        '<span class="sk-acc-val" id="skNCnt">0 uložených</span>' +
        '<span class="sk-acc-meta" id="skNPrev">Žádné poznámky</span>' +
      '</span>' +
      '<span class="sk-chev" aria-hidden="true">⌄</span>';
    head.replaceWith(btn);

    _state.notesList = false;
    applyState('notesList');
    refreshNotesSummary();
  }

  /* ── CLICK HANDLER ───────────────────────────────────────────────────
   * Běží v BUBBLING phase (false).
   * index.html má capture handler (true) na #taskList — ten dostane
   * kliky na .tck/.tdel/[data-action] dříve než tento handler.
   * Tento handler řeší POUZE klik na summary accordion button.
   ─────────────────────────────────────────────────────────────────── */
  function installClick() {
    if (document.__skClickV7) return;
    document.__skClickV7 = true;

    document.addEventListener('click', function(e) {
      var t = e.target;
      if (!t || !t.closest) return;

      /* Nikdy nezasahuj do kliků na task akce — nechej je probublat do
         capture handleru v index.html */
      if (t.closest('.tck, .tdel, [data-action], [data-note-del], .n-del,' +
                     ' #taskAddBtn, #taskInput, #taskSearch, #taskPriority,' +
                     ' #saveNoteBtn, #noteDraft, #notesSearch, #notesDateFilter,' +
                     ' .ladd, a, [data-toggle-dd]')) {
        return; /* event volně probublá */
      }

      /* Klik na accordion button */
      var btn = t.closest('.sk-acc-btn, .sk-acc-btn-n');
      if (!btn) return;

      var card   = btn.closest('.card');
      if (!card) return;
      var listId = card.classList.contains('sk-task-card') ? 'taskList' : 'notesList';

      _state[listId] = !_state[listId];
      applyState(listId);
      e.preventDefault();
      e.stopPropagation();
    }, false);
  }

  /* ── CSS ─────────────────────────────────────────────────────────── */
  function installCSS() {
    if (getEl('sk-tif-css')) return;
    var s = document.createElement('style');
    s.id = 'sk-tif-css';
    s.textContent = [
      /* Accordion button */
      '.sk-acc-btn,.sk-acc-btn-n{',
        'width:100%;display:flex;align-items:center;justify-content:space-between;',
        'gap:12px;padding:0;margin:0 0 1rem;border:0;background:transparent;',
        'color:inherit;font:inherit;text-align:left;cursor:pointer;',
        'touch-action:manipulation;-webkit-tap-highlight-color:transparent;',
        'user-select:none;-webkit-user-select:none}',

      '.sk-acc-copy{display:flex;flex:1;min-width:0;flex-direction:column}',
      '.sk-acc-title{font-size:13px;font-weight:700;color:var(--ink)}',
      '.sk-acc-val{font-size:12px;font-weight:600;color:var(--ink2);margin-top:3px}',

      '.sk-acc-prog{width:min(180px,100%);height:5px;margin-top:6px;',
        'border-radius:999px;background:var(--surface3,#EDEDF3);overflow:hidden}',
      '.sk-acc-prog>span{display:block;height:100%;border-radius:inherit;',
        'background:var(--primary,#6C5CE7);transition:width .2s}',

      '.sk-acc-meta{font-size:11px;color:var(--ink3);margin-top:4px;',
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',

      '.sk-chev{width:32px;height:32px;flex-shrink:0;display:grid;place-items:center;',
        'border:1px solid var(--border,#E8E8F0);border-radius:50%;',
        'background:var(--surface2,#F4F4F8);color:var(--ink2);',
        'font-size:16px;line-height:1;pointer-events:none}',

      /* Collapsed: skryj obsah pod buttonem */
      '.sk-task-card.is-collapsed .toolbar-row,',
      '.sk-task-card.is-collapsed .ti-row,',
      '.sk-task-card.is-collapsed #taskList{display:none!important}',

      '.sk-notes-card.is-collapsed .nrow,',
      '.sk-notes-card.is-collapsed #notesFilterInfo,',
      '.sk-notes-card.is-collapsed #notesList{display:none!important}',

      /* Expanded: toolbar viditelný */
      '.sk-task-card.is-expanded .toolbar-row{display:flex!important}',

      /* Checkboxy — iOS fix */
      '.tck{',
        '-webkit-appearance:none!important;appearance:none!important;',
        'touch-action:manipulation!important;',
        '-webkit-tap-highlight-color:transparent!important;',
        'cursor:pointer!important;position:relative!important;',
        'overflow:visible!important}',

      '.tck.checked{',
        'background:var(--primary,#6C5CE7)!important;',
        'border-color:var(--primary,#6C5CE7)!important;',
        'color:#fff!important;font-size:12px!important;font-weight:800!important;',
        'display:flex!important;align-items:center!important;justify-content:center!important}',

      '.tck.checked::after{content:none!important}',

      /* Smazání — větší touch target */
      '.tdel{',
        'touch-action:manipulation!important;',
        '-webkit-tap-highlight-color:transparent!important;',
        'cursor:pointer!important;min-width:36px!important;min-height:36px!important;',
        'display:inline-flex!important;align-items:center!important;',
        'justify-content:center!important}',

      /* Mobile scroll při rozbalení */
      '@media(max-width:700px){',
        '.sk-task-card.is-expanded #taskList{',
          'max-height:min(45vh,380px)!important;overflow-y:auto!important;',
          '-webkit-overflow-scrolling:touch!important;',
          'overscroll-behavior:contain!important;touch-action:pan-y!important}',
        '.sk-notes-card.is-expanded #notesList{',
          'max-height:min(45vh,380px)!important;overflow-y:auto!important;',
          '-webkit-overflow-scrolling:touch!important;',
          'overscroll-behavior:contain!important;touch-action:pan-y!important}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── INICIALIZACE ────────────────────────────────────────────────── */
  function init() {
    installCSS();
    makeTaskAccordion();
    makeNotesAccordion();
    installClick();
    /* Hook musí být po makeAccordion aby orig funkce existovala */
    hookRender('renderTasks', 'taskList',  refreshTaskSummary);
    hookRender('renderNotes', 'notesList', refreshNotesSummary);
    refreshTaskSummary();
    refreshNotesSummary();
  }

  window.__SKOLA_TASK_FIX_V7__ = { reinit: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

})();
