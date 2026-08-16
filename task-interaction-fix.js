/* SkolaApp — dashboard task and note accordions */
(function () {
  'use strict';

  if (window.__SKOLA_DASHBOARD_ACCORDIONS__) {
    window.__SKOLA_DASHBOARD_ACCORDIONS__.reapply();
    return;
  }

  function getTasks() { return Array.isArray(window.tasks) ? window.tasks : []; }
  function getNotes() { return Array.isArray(window.notes) ? window.notes : []; }

  function refreshTaskSummary() {
    var tasks = getTasks();
    var done = tasks.filter(function (task) { return !!task.done; }).length;
    var total = tasks.length;
    var remaining = total - done;
    var doneEl = document.getElementById('skTaskDone');
    var totalEl = document.getElementById('skTaskTotal');
    var progressEl = document.getElementById('skTaskProgress');
    var metaEl = document.getElementById('skTaskMeta');

    if (doneEl) doneEl.textContent = done;
    if (totalEl) totalEl.textContent = total;
    if (progressEl) progressEl.style.width = (total ? Math.round((done / total) * 100) : 0) + '%';
    if (metaEl) metaEl.textContent = total ? (remaining ? remaining + ' zbývá' : 'Všechno hotovo') : 'Zatím žádné úkoly';
  }

  function refreshNotesSummary() {
    var notes = getNotes();
    var countEl = document.getElementById('skNotesCount');
    var previewEl = document.getElementById('skNotesPreview');
    var latest = notes[0] && notes[0].text ? String(notes[0].text).trim() : '';

    if (countEl) countEl.textContent = notes.length + ' uložených';
    if (previewEl) previewEl.textContent = latest || 'Žádné uložené poznámky';
  }

  function setExpanded(card, button, expanded) {
    card.classList.toggle('is-expanded', expanded);
    card.classList.toggle('is-collapsed', !expanded);
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    button.querySelector('.sk-summary-chevron').textContent = expanded ? '⌃' : '⌄';
  }

  function bindToggle(card, button) {
    function toggle() { setExpanded(card, button, !card.classList.contains('is-expanded')); }
    button.addEventListener('click', toggle);
    button.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });
  }

  function setupTaskAccordion() {
    var list = document.getElementById('taskList');
    var card = list && list.closest('.card');
    if (!card || card.dataset.skTaskAccordion === '1') return;

    var oldHeader = card.querySelector('.card-hd');
    if (!oldHeader) return;

    card.dataset.skTaskAccordion = '1';
    card.classList.add('sk-task-collapsible');
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'sk-task-summary';
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="sk-summary-copy"><span class="sk-summary-title">Úkoly</span><span class="sk-summary-value"><strong id="skTaskDone">0</strong> / <span id="skTaskTotal">0</span> splněno</span><span class="sk-summary-progress"><span id="skTaskProgress"></span></span><span class="sk-summary-meta" id="skTaskMeta">Zatím žádné úkoly</span></span><span class="sk-summary-chevron" aria-hidden="true">⌄</span>';
    oldHeader.replaceWith(button);
    setExpanded(card, button, false);
    bindToggle(card, button);
    refreshTaskSummary();
  }

  function setupNotesAccordion() {
    var list = document.getElementById('notesList');
    var card = list && list.closest('.card');
    if (!card || card.dataset.skNotesAccordion === '1') return;

    var oldHeader = card.querySelector('.card-hd');
    if (!oldHeader) return;

    var search = document.getElementById('notesSearch');
    if (search && search.parentElement) search.parentElement.classList.add('sk-notes-tools');

    card.dataset.skNotesAccordion = '1';
    card.classList.add('sk-note-collapsible');
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'sk-note-summary';
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="sk-summary-copy"><span class="sk-summary-title">Poznámky</span><span class="sk-summary-value" id="skNotesCount">0 uložených</span><span class="sk-summary-meta" id="skNotesPreview">Žádné uložené poznámky</span></span><span class="sk-summary-chevron" aria-hidden="true">⌄</span>';
    oldHeader.replaceWith(button);
    setExpanded(card, button, false);
    bindToggle(card, button);
    refreshNotesSummary();
  }

  function injectStyles() {
    var existing = document.getElementById('sk-dashboard-accordion-styles');
    if (existing) {
      document.head.appendChild(existing);
      return;
    }

    var style = document.createElement('style');
    style.id = 'sk-dashboard-accordion-styles';
    style.textContent = '\n      #page-dashboard .sk-task-summary,\n      #page-dashboard .sk-note-summary {\n        width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px;\n        margin: 0 0 1.1rem; padding: 0; border: 0; background: transparent; color: inherit;\n        text-align: left; font: inherit; cursor: pointer;\n      }\n      #page-dashboard .sk-summary-copy { display: flex; flex: 1; min-width: 0; flex-direction: column; }\n      #page-dashboard .sk-summary-title { font-size: 13px; font-weight: 600; color: var(--ink); }\n      #page-dashboard .sk-summary-value { margin-top: 2px; font-size: 12px; font-weight: 600; color: var(--ink2); }\n      #page-dashboard .sk-summary-progress { width: min(180px, 100%); height: 5px; margin-top: 7px; overflow: hidden; border-radius: 999px; background: var(--surface3); }\n      #page-dashboard .sk-summary-progress > span { display: block; height: 100%; border-radius: inherit; background: var(--primary); transition: width .15s ease; }\n      #page-dashboard .sk-summary-meta { margin-top: 5px; overflow: hidden; color: var(--ink3); font-size: 11px; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }\n      #page-dashboard .sk-summary-chevron { display: grid; width: 32px; height: 32px; flex: 0 0 32px; place-items: center; border: 1px solid var(--border); border-radius: 50%; background: var(--surface2); color: var(--ink2); font-size: 17px; line-height: 1; }\n      #page-dashboard .sk-task-summary:focus-visible,\n      #page-dashboard .sk-note-summary:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }\n      #page-dashboard .sk-task-collapsible.is-collapsed .toolbar-row,\n      #page-dashboard .sk-task-collapsible.is-collapsed .ti-row,\n      #page-dashboard .sk-task-collapsible.is-collapsed #taskList,\n      #page-dashboard .sk-note-collapsible.is-collapsed .nrow,\n      #page-dashboard .sk-note-collapsible.is-collapsed .sk-notes-tools,\n      #page-dashboard .sk-note-collapsible.is-collapsed #notesFilterInfo,\n      #page-dashboard .sk-note-collapsible.is-collapsed #notesList { display: none !important; }\n      #page-dashboard .sk-task-collapsible.is-expanded .toolbar-row { display: flex !important; }\n      @media (max-width: 700px) {\n        #page-dashboard .sk-task-collapsible, #page-dashboard .sk-note-collapsible { overflow: hidden; }\n        #page-dashboard .sk-task-summary, #page-dashboard .sk-note-summary { min-height: 68px; margin-bottom: 0; }\n        #page-dashboard .sk-summary-title { font-size: 14px; font-weight: 700; }\n        #page-dashboard .sk-summary-value { font-size: 13px; }\n      }\n    ';
    document.head.appendChild(style);
  }

  function wrapRenderer(name, refresh) {
    var original = window[name];
    if (typeof original !== 'function' || original.__skAccordionWrapped) return;

    function wrapped() {
      var result = original.apply(this, arguments);
      refresh();
      return result;
    }
    wrapped.__skAccordionWrapped = true;
    window[name] = wrapped;
  }

  function init() {
    injectStyles();
    setupTaskAccordion();
    setupNotesAccordion();
    wrapRenderer('renderTasks', refreshTaskSummary);
    wrapRenderer('renderNotes', refreshNotesSummary);
    refreshTaskSummary();
    refreshNotesSummary();
  }

  window.__SKOLA_DASHBOARD_ACCORDIONS__ = { reapply: init };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

