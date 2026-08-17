/* SkolaApp — stable dashboard task/note accordions
 *
 * OPRAVA (2026-08): Accordion si pamatuje stav (expanded/collapsed)
 * v objekt-level proměnné _state nezávisle na DOM.
 * renderTasks() / renderNotes() přijdou s novými daty → DOM se přepíše →
 * _applyState() okamžitě obnoví správný display stav.
 * Stav se nikdy neodvozuje z CSS třídy; CSS třídy jsou jen vizuální výstup.
 *
 * Proč původní verze selhávala:
 *   makeTaskAccordion() volalo expanded(card, btn, false) → card.classList = 'is-collapsed'
 *   CSS: .is-collapsed #taskList { display:none !important }
 *   Po příchodu Firebase dat renderTasks() naplnil #taskList, ale
 *   'is-collapsed' zůstal → data byla v DOM, ale neviditelná.
 *   Neexistoval žádný hook, který by po renderu obnovil expanded stav.
 */
(function () {
  'use strict';

  if (window.__SKOLA_DASHBOARD_ACCORDIONS__) {
    window.__SKOLA_DASHBOARD_ACCORDIONS__.reapply();
    return;
  }

  /* ─── stav accordionů ─────────────────────────────────────────
   * Klíč je ID listu ('taskList' / 'notesList').
   * true  = expanded (obsah viditelný)
   * false = collapsed (obsah skrytý)
   * Výchozí: false (collapsed) dokud uživatel neklikne nebo
   * dokud nepřijdou data (pak se karta sama neotevírá — jen
   * _applyState zajistí zobrazení aktuálního stavu).
   ─────────────────────────────────────────────────────────────── */
  var _state = { taskList: false, notesList: false };

  /* ─── helpers ──────────────────────────────────────────────── */
  function getEl(id) { return document.getElementById(id); }
  function txt(id) {
    var e = getEl(id);
    return e ? String(e.textContent || '').trim() : '';
  }

  /* ─── datové zdroje ────────────────────────────────────────── */
  function taskSource() {
    if (Array.isArray(window.tasks) && window.tasks.length) return window.tasks;
    try { var r = JSON.parse(localStorage.getItem('zs_tasks_v3') || '[]'); return Array.isArray(r) ? r : []; }
    catch (e) { return []; }
  }

  function notesSource() {
    if (Array.isArray(window.notes) && window.notes.length) return window.notes;
    try { var r = JSON.parse(localStorage.getItem('zs_notes_list_v1') || '[]'); return Array.isArray(r) ? r : []; }
    catch (e) { return []; }
  }

  /* ─── aplikace stavu na DOM ─────────────────────────────────
   * Tato funkce je JEDINÉ místo, které mění expanded/collapsed CSS třídy.
   * Volá se: při inicializaci, po každém renderu, po každém kliku.
   ─────────────────────────────────────────────────────────────── */
  function _applyState(listId) {
    var list = getEl(listId);
    if (!list) return;
    var card = list.closest('.card');
    var btn  = card && card.querySelector(listId === 'taskList' ? '.sk-task-summary' : '.sk-note-summary');
    if (!card || !btn) return;
    var on = !!_state[listId];
    card.classList.toggle('is-expanded', on);
    card.classList.toggle('is-collapsed', !on);
    btn.setAttribute('aria-expanded', on ? 'true' : 'false');
    var chevron = btn.querySelector('.sk-summary-chevron');
    if (chevron) chevron.textContent = on ? '⌃' : '⌄';
  }

  function applyAllStates() {
    _applyState('taskList');
    _applyState('notesList');
  }

  /* ─── shrnutí / summary refresh ────────────────────────────── */
  function refreshTaskSummary() {
    var source = taskSource();
    var done  = source.filter(function (t) { return !!t.done; }).length;
    var total = source.length;
    var doneEl  = getEl('skTaskDone');
    var totalEl = getEl('skTaskTotal');
    var prog    = getEl('skTaskProgress');
    var meta    = getEl('skTaskMeta');
    if (doneEl)  doneEl.textContent  = done;
    if (totalEl) totalEl.textContent = total;
    if (prog)    prog.style.width    = (total ? Math.round(done / total * 100) : 0) + '%';
    if (meta)    meta.textContent    = total ? (total - done) + ' zbývá' : 'Zatím žádné úkoly';
    if (!source.length) {
      var m = txt('doneCount').match(/(\d+)\s*\/\s*(\d+)/);
      if (m) {
        var d = Number(m[1]), t = Number(m[2]);
        if (doneEl)  doneEl.textContent  = d;
        if (totalEl) totalEl.textContent = t;
        if (prog)    prog.style.width    = (t ? Math.round(d / t * 100) : 0) + '%';
        if (meta)    meta.textContent    = t ? ((t - d) + ' zbývá') : 'Zatím žádné úkoly';
      }
    }
  }

  function refreshNotesSummary() {
    var source  = notesSource();
    var count   = getEl('skNotesCount');
    var preview = getEl('skNotesPreview');
    var c = source.length + ' uložených';
    var p = (source[0] && source[0].text) ? String(source[0].text).trim() : 'Žádné uložené poznámky';
    if (count)   count.textContent   = c;
    if (preview) preview.textContent = p;
    if (!source.length) {
      var m = txt('notesCount').match(/\d+/);
      if (m && count) count.textContent = Number(m[0]) + ' uložených';
    }
  }

  /* ─── synchronizace checkboxů ──────────────────────────────── */
  function syncCheckmarks(root) {
    var scope = root || document;
    if (!scope.querySelectorAll) return;
    scope.querySelectorAll('.tck').forEach(function (b) {
      var on = b.classList.contains('checked');
      if (b.textContent !== (on ? '✓' : ''))   b.textContent = on ? '✓' : '';
      var ap = on ? 'true' : 'false';
      if (b.getAttribute('aria-pressed') !== ap) b.setAttribute('aria-pressed', ap);
    });
  }

  /* ─── sestavení accordionů ──────────────────────────────────── */
  function makeTaskAccordion() {
    var list = getEl('taskList');
    var card = list && list.closest('.card');
    if (!card || card.dataset.skTaskAccordion === '1') return;
    var head = card.querySelector('.card-hd');
    if (!head) return;
    card.dataset.skTaskAccordion = '1';
    card.classList.add('sk-task-collapsible');
    var btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'sk-task-summary';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML =
      '<span class="sk-summary-copy">' +
        '<span class="sk-summary-title">Úkoly</span>' +
        '<span class="sk-summary-value"><strong id="skTaskDone">0</strong> / <span id="skTaskTotal">0</span> splněno</span>' +
        '<span class="sk-summary-progress"><span id="skTaskProgress"></span></span>' +
        '<span class="sk-summary-meta" id="skTaskMeta">Zatím žádné úkoly</span>' +
      '</span>' +
      '<span class="sk-summary-chevron" aria-hidden="true">⌄</span>';
    head.replaceWith(btn);
    /* Nastav stav přes _state + _applyState — NE přes přímé classList */
    _state.taskList = false;
    _applyState('taskList');
    refreshTaskSummary();
  }

  function makeNotesAccordion() {
    var list = getEl('notesList');
    var card = list && list.closest('.card');
    if (!card || card.dataset.skNotesAccordion === '1') return;
    var head = card.querySelector('.card-hd');
    if (!head) return;
    var search = getEl('notesSearch');
    if (search && search.parentElement) search.parentElement.classList.add('sk-notes-tools');
    card.dataset.skNotesAccordion = '1';
    card.classList.add('sk-note-collapsible');
    var btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'sk-note-summary';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML =
      '<span class="sk-summary-copy">' +
        '<span class="sk-note-heading">' +
          '<span class="sk-note-icon" aria-hidden="true">✎</span>' +
          '<span class="sk-summary-title">Poznámky</span>' +
        '</span>' +
        '<span class="sk-summary-value" id="skNotesCount">0 uložených</span>' +
        '<span class="sk-summary-meta" id="skNotesPreview">Žádné uložené poznámky</span>' +
      '</span>' +
      '<span class="sk-summary-chevron" aria-hidden="true">⌄</span>';
    head.replaceWith(btn);
    _state.notesList = false;
    _applyState('notesList');
    refreshNotesSummary();
  }

  /* ─── click handler pro accordion ──────────────────────────────
   * KLÍČOVÁ OPRAVA:
   * - Klik na summary button → toggle _state → _applyState
   * - Klik na .tck (checkbox), .tdel, [data-action], [data-note-del]:
   *   NE stopPropagation na tyto — necháme je probublat normálně
   *   (index.html má vlastní handler na delegaci).
   ─────────────────────────────────────────────────────────────── */
  function installAccordionClick() {
    if (document.__skAccordionClickInstalled) return;
    document.__skAccordionClickInstalled = true;

    document.addEventListener('click', function (e) {
      /* Ignoruj kliknutí na interaktivní prvky UVNITŘ listu */
      if (e.target && e.target.closest) {
        var skip = e.target.closest('.tck, .tdel, [data-action], [data-note-del], .n-del, .tadd, button:not(.sk-task-summary):not(.sk-note-summary)');
        if (skip) return; /* nechej event probublat dál normálně */
      }

      /* Klik na summary header → toggle accordion */
      var summary = e.target && e.target.closest ? e.target.closest('.sk-task-summary, .sk-note-summary') : null;
      if (!summary) return;

      var card = summary.closest('.card');
      if (!card) return;

      /* Zjisti listId podle třídy karty */
      var listId = card.classList.contains('sk-task-collapsible') ? 'taskList' : 'notesList';

      /* Toggle stav v _state */
      _state[listId] = !_state[listId];

      /* Aplikuj na DOM */
      _applyState(listId);

      /* Zastav propagaci jen pokud jsme accordion button — ne jiné prvky */
      e.stopPropagation();
    }, false); /* bubbling phase, ne capture — aby interní handlery v index.html mohly zachytit dřív */
  }

  /* ─── MutationObserver — reaguje na renderTasks/renderNotes ───
   * Po každé mutaci #taskList nebo #notesList znovu aplikujeme
   * uložený _state. Tím je zaručeno, že CSS nikdy neodporuje _state.
   ─────────────────────────────────────────────────────────────── */
  function installObservers() {
    var taskList = getEl('taskList');
    if (taskList && !taskList.__skObserver) {
      taskList.__skObserver = new MutationObserver(function () {
        /* Data se změnila → obnov stav z _state */
        _applyState('taskList');
        syncCheckmarks(taskList);
        /* Pokud list obsahuje jen "prázdný stav" ale window.tasks má data,
           renderTasks() byl volán dřív než Firestore vrátil data.
           Zavolej ho znovu teď kdy tasks jsou k dispozici. */
        var isEmpty = taskList.querySelector('.tempty') && !taskList.querySelector('.titem');
        if (isEmpty && Array.isArray(window.tasks) && !window.tasks.length) {
          try {
            var localTasks = JSON.parse(localStorage.getItem('zs_tasks_v3') || '[]');
            if (Array.isArray(localTasks) && localTasks.length) {
              window.tasks = localTasks;
              if (typeof window.renderTasks === 'function') window.renderTasks();
              if (typeof window.calRender === 'function') window.calRender();
              return;
            }
          } catch (e) {}
        }
        if (isEmpty && Array.isArray(window.tasks) && window.tasks.length) {
          if (typeof window.renderTasks === 'function') window.renderTasks();
          return; /* refreshTaskSummary se zavolá z dalšího MutationObserver triggeru */
        }
        refreshTaskSummary();
      });
      taskList.__skObserver.observe(taskList, { childList: true, subtree: true });
    }

    var notesList = getEl('notesList');
    if (notesList && !notesList.__skObserver) {
      notesList.__skObserver = new MutationObserver(function () {
        _applyState('notesList');
        refreshNotesSummary();
      });
      notesList.__skObserver.observe(notesList, { childList: true, subtree: true });
    }
  }

  /* ─── mazání poznámek ───────────────────────────────────────── */
  function installNoteDelete() {
    var list = getEl('notesList');
    if (!list || list.__skNoteDelete) return;
    list.__skNoteDelete = true;
    list.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-note-del]') : null;
      if (!btn || !list.contains(btn)) return;
      var idx = parseInt(btn.getAttribute('data-note-del'), 10);
      if (!Number.isInteger(idx) || !Array.isArray(window.notes) || !window.notes[idx]) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      var note = window.notes[idx];
      if (window.fbSyncEnabled && note.id && typeof window.fbDeleteNote === 'function') {
        window.fbDeleteNote(note.id);
      } else {
        window.notes.splice(idx, 1);
        if (typeof window.saveJSON === 'function') window.saveJSON('zs_notes_list_v1', window.notes);
        if (typeof window.renderNotes === 'function') window.renderNotes();
      }
    }, true);
  }

  /* ─── CSS ───────────────────────────────────────────────────── */
  function installStyles() {
    if (getEl('sk-dashboard-accordion-styles')) return;
    var s = document.createElement('style');
    s.id = 'sk-dashboard-accordion-styles';
    s.textContent = [
      /* Summary button */
      '#page-dashboard .sk-task-summary,#page-dashboard .sk-note-summary{',
        'position:relative;z-index:20;width:100%;display:flex;align-items:center;',
        'justify-content:space-between;gap:12px;margin:0 0 1.1rem;padding:0;',
        'border:0;background:transparent;color:inherit;text-align:left;font:inherit;',
        'cursor:pointer;pointer-events:auto;touch-action:manipulation;',
        '-webkit-tap-highlight-color:transparent}',

      '#page-dashboard .sk-summary-copy{display:flex;flex:1;min-width:0;flex-direction:column}',
      '#page-dashboard .sk-note-heading{display:inline-flex;align-items:center;gap:6px}',
      '#page-dashboard .sk-note-icon{color:var(--amber);font-size:15px;line-height:1}',
      '#page-dashboard .sk-summary-title{font-size:13px;font-weight:600;color:var(--ink)}',
      '#page-dashboard .sk-summary-value{margin-top:2px;font-size:12px;font-weight:600;color:var(--ink2)}',
      '#page-dashboard .sk-summary-progress{',
        'width:min(180px,100%);height:5px;margin-top:7px;overflow:hidden;',
        'border-radius:999px;background:var(--surface3)}',
      '#page-dashboard .sk-summary-progress>span{',
        'display:block;height:100%;border-radius:inherit;',
        'background:var(--primary);transition:width .15s ease}',
      '#page-dashboard .sk-summary-meta{',
        'margin-top:5px;overflow:hidden;color:var(--ink3);font-size:11px;',
        'font-weight:500;text-overflow:ellipsis;white-space:nowrap}',
      '#page-dashboard .sk-summary-chevron{',
        'display:grid;width:32px;height:32px;flex:0 0 32px;place-items:center;',
        'border:1px solid var(--border);border-radius:50%;',
        'background:var(--surface2);color:var(--ink2);font-size:17px;',
        'line-height:1;pointer-events:none}',

      /* Collapsed: skryj obsah */
      '#page-dashboard .sk-task-collapsible.is-collapsed .toolbar-row,',
      '#page-dashboard .sk-task-collapsible.is-collapsed .ti-row,',
      '#page-dashboard .sk-task-collapsible.is-collapsed #taskList{display:none!important}',

      '#page-dashboard .sk-note-collapsible.is-collapsed .nrow,',
      '#page-dashboard .sk-note-collapsible.is-collapsed .sk-notes-tools,',
      '#page-dashboard .sk-note-collapsible.is-collapsed #notesFilterInfo,',
      '#page-dashboard .sk-note-collapsible.is-collapsed #notesList{display:none!important}',

      /* Expanded: toolbar viditelný */
      '#page-dashboard .sk-task-collapsible.is-expanded .toolbar-row{display:flex!important}',

      /* Checkboxy */
      '#page-dashboard .tck{',
        'position:relative!important;overflow:hidden;',
        '-webkit-appearance:none!important;appearance:none!important}',
      '#page-dashboard .tck.checked{',
        'background:var(--primary)!important;border-color:var(--primary)!important;',
        'color:#fff!important;font-size:12px!important;font-weight:800!important;',
        'line-height:1!important;text-align:center!important}',
      '#page-dashboard .tck.checked::after{content:none!important}',

      /* Mazání poznámek — větší plocha */
      '#page-dashboard .n-del{',
        'min-width:36px!important;min-height:36px!important;padding:7px!important;',
        'display:inline-flex!important;align-items:center!important;',
        'justify-content:center!important;touch-action:manipulation!important;',
        'pointer-events:auto!important}',

      /* Mobile */
      '@media(max-width:700px){',
        '#page-dashboard .sk-task-summary,#page-dashboard .sk-note-summary{min-height:68px;margin-bottom:0}',
        '#page-dashboard .sk-summary-title{font-size:14px;font-weight:700}',
        '#page-dashboard .sk-summary-value{font-size:13px}',

        /* Scroll při rozbalení */
        '#page-dashboard .sk-task-collapsible.is-expanded #taskList{',
          'max-height:min(42vh,360px)!important;overflow-y:auto!important;',
          'overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;',
          'overscroll-behavior:contain!important;touch-action:pan-y!important;',
          'padding-right:2px}',

        /* Dotykové cíle pro checkbox a smazání */
        '#page-dashboard .sk-task-collapsible.is-expanded .tdel{',
          'opacity:1!important;visibility:visible!important;',
          'pointer-events:auto!important;position:relative!important;z-index:3!important;',
          'min-width:30px!important;min-height:30px!important}',
        '#page-dashboard .sk-task-collapsible.is-expanded .tck{',
          'position:relative!important;z-index:3!important;',
          'pointer-events:auto!important;min-width:30px!important;min-height:30px!important}',
        '#page-dashboard .sk-task-collapsible.is-expanded .titem{position:relative;z-index:1}',
        '#page-dashboard .sk-task-collapsible.is-expanded #taskList button{',
          'touch-action:manipulation;-webkit-tap-highlight-color:transparent}',

        '#page-dashboard .sk-note-collapsible.is-expanded #notesList{',
          'max-height:min(42vh,360px)!important;overflow-y:auto!important;',
          '-webkit-overflow-scrolling:touch!important;',
          'overscroll-behavior:contain!important;touch-action:pan-y!important}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ─── inicializace ──────────────────────────────────────────── */
  function init() {
    installStyles();
    makeTaskAccordion();
    makeNotesAccordion();
    installAccordionClick();
    installObservers();
    installNoteDelete();
    refreshTaskSummary();
    refreshNotesSummary();
    syncCheckmarks(document);
  }

  window.__SKOLA_DASHBOARD_ACCORDIONS__ = { reapply: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
