/* SkolaApp — dashboard interaction layer
   Keeps the existing data model, task handlers and mobile navigation intact.
   Adds reliable task completion + compact dashboard accordions. */
(function () {
  'use strict';

  function bindTaskCompletion() {
    var list = document.getElementById('taskList');
    if (!list || list.__taskInteractionFix) return;
    list.__taskInteractionFix = true;

    list.addEventListener('click', function (e) {
      var el = e.target.closest('[data-action="check"]');
      if (!el || !list.contains(el)) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      var i = parseInt(el.dataset.i, 10);
      if (!Number.isInteger(i) || !window.tasks || !window.tasks[i]) return;

      var task = window.tasks[i];
      var previousDone = !!task.done;
      var nextDone = !previousDone;
      task.done = nextDone;

      if (typeof window.renderTasks === 'function') window.renderTasks();
      if (typeof window.calRender === 'function') window.calRender();

      if (window.fbSyncEnabled && task.id && typeof window.fbToggleTask === 'function') {
        var taskId = task.id;
        if (window.fbPendingTaskToggles) window.fbPendingTaskToggles[taskId] = nextDone;

        window.fbToggleTask(taskId, nextDone).then(function () {
          if (window.fbPendingTaskToggles) delete window.fbPendingTaskToggles[taskId];
        }).catch(function (err) {
          if (window.fbPendingTaskToggles) delete window.fbPendingTaskToggles[taskId];
          var current = window.tasks.find(function (t) { return t.id === taskId; });
          if (current) current.done = previousDone;
          if (typeof window.renderTasks === 'function') window.renderTasks();
          if (typeof window.calRender === 'function') window.calRender();
          if (typeof window.showToast === 'function') window.showToast('⚠️ Nepodařilo se uložit úkol');
          console.error('[TASK_INTERACTION_FIX] toggle failed:', err);
        });
      } else if (typeof window.saveTasks === 'function') {
        window.saveTasks();
      }
    }, true);
  }

  function getDashboardCard(listId) {
    var list = document.getElementById(listId);
    if (!list) return null;
    var card = list.closest('.card');
    if (!card) return null;
    var dashboard = document.getElementById('page-dashboard');
    if (dashboard && !dashboard.contains(card)) return null;
    return card;
  }

  function taskSummary() {
    var tasks = Array.isArray(window.tasks) ? window.tasks : [];
    var total = tasks.length;
    var done = tasks.filter(function (t) { return !!t.done; }).length;
    var remaining = Math.max(0, total - done);
    var percent = total ? Math.round((done / total) * 100) : 0;
    return { total: total, done: done, remaining: remaining, percent: percent };
  }

  function noteSummary() {
    var notes = Array.isArray(window.notes) ? window.notes : [];
    return { total: notes.length, latest: notes.length ? notes[0] : null };
  }

  function escapeText(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function latestNoteLabel(note) {
    if (!note) return 'Žádná uložená poznámka';
    var text = String(note.text || note.content || note.note || '').trim().replace(/\s+/g, ' ');
    if (!text) return 'Poslední uložená poznámka';
    return text.length > 54 ? text.slice(0, 54) + '…' : text;
  }

  function buildTaskHeader(header) {
    var s = taskSummary();
    header.className = 'card-hd sk-collapse-hd';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('aria-controls', 'taskList');
    header.innerHTML =
      '<div class="sk-summary-main">' +
        '<div class="sk-summary-icon sk-icon-task" aria-hidden="true">✓</div>' +
        '<div class="sk-summary-copy">' +
          '<div class="sk-summary-title">Úkoly</div>' +
          '<div class="sk-summary-value"><strong id="skTaskDone">' + s.done + '</strong> / <span id="skTaskTotal">' + s.total + '</span> splněno</div>' +
          '<div class="sk-progress" aria-hidden="true"><span id="skTaskProgress" style="width:' + s.percent + '%"></span></div>' +
          '<div class="sk-summary-meta" id="skTaskMeta">' + (s.remaining ? s.remaining + ' zbývá' : (s.total ? 'Všechno hotovo' : 'Zatím žádné úkoly')) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sk-summary-right"><span class="sk-chevron" aria-hidden="true">⌄</span></div>';
  }

  function buildNotesHeader(header) {
    var s = noteSummary();
    header.className = 'card-hd sk-collapse-hd';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('aria-controls', 'notesList');
    header.innerHTML =
      '<div class="sk-summary-main">' +
        '<div class="sk-summary-icon sk-icon-note" aria-hidden="true">✎</div>' +
        '<div class="sk-summary-copy">' +
          '<div class="sk-summary-title">Poznámky</div>' +
          '<div class="sk-summary-value"><strong id="skNotesTotal">' + s.total + '</strong> uložených</div>' +
          '<div class="sk-summary-meta" id="skNotesMeta">' + escapeText(latestNoteLabel(s.latest)) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sk-summary-right"><span class="sk-chevron" aria-hidden="true">⌄</span></div>';
  }

  function refreshTaskSummary() {
    var s = taskSummary();
    var done = document.getElementById('skTaskDone');
    var total = document.getElementById('skTaskTotal');
    var progress = document.getElementById('skTaskProgress');
    var meta = document.getElementById('skTaskMeta');
    if (done) done.textContent = s.done;
    if (total) total.textContent = s.total;
    if (progress) progress.style.width = s.percent + '%';
    if (meta) meta.textContent = s.remaining ? s.remaining + ' zbývá' : (s.total ? 'Všechno hotovo' : 'Zatím žádné úkoly');
  }

  function refreshNoteSummary() {
    var s = noteSummary();
    var total = document.getElementById('skNotesTotal');
    var meta = document.getElementById('skNotesMeta');
    if (total) total.textContent = s.total;
    if (meta) meta.textContent = latestNoteLabel(s.latest);
  }

  function setExpanded(card, expanded) {
    card.classList.toggle('is-expanded', expanded);
    card.classList.toggle('is-collapsed', !expanded);
    var header = card.querySelector('.sk-collapse-hd');
    if (header) {
      header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      var chevron = header.querySelector('.sk-chevron');
      if (chevron) chevron.textContent = expanded ? '⌃' : '⌄';
    }
  }

  function bindAccordion(card, kind) {
    if (!card || card.__skAccordion) return;
    card.__skAccordion = true;
    card.classList.add('sk-collapsible', 'is-collapsed');

    var header = card.querySelector('.card-hd');
    if (!header) return;
    if (kind === 'tasks') buildTaskHeader(header);
    else buildNotesHeader(header);

    function toggle() {
      setExpanded(card, !card.classList.contains('is-expanded'));
    }

    header.addEventListener('click', function (e) {
      if (e.target.closest('a,button,input,select,textarea')) return;
      toggle();
    });
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }

  function bindAccordions() {
    var taskCard = getDashboardCard('taskList');
    var notesCard = getDashboardCard('notesList');
    bindAccordion(taskCard, 'tasks');
    bindAccordion(notesCard, 'notes');
    refreshTaskSummary();
    refreshNoteSummary();
  }

  function observeChanges() {
    var taskList = document.getElementById('taskList');
    var notesList = document.getElementById('notesList');
    if (taskList && !taskList.__skSummaryObserver) {
      taskList.__skSummaryObserver = new MutationObserver(refreshTaskSummary);
      taskList.__skSummaryObserver.observe(taskList, { childList: true, subtree: true, attributes: true });
    }
    if (notesList && !notesList.__skSummaryObserver) {
      notesList.__skSummaryObserver = new MutationObserver(refreshNoteSummary);
      notesList.__skSummaryObserver.observe(notesList, { childList: true, subtree: true });
    }
  }

  function injectStyles() {
    if (document.getElementById('sk-dashboard-accordion-styles')) return;
    var style = document.createElement('style');
    style.id = 'sk-dashboard-accordion-styles';
    style.textContent = `
      .sk-collapsible{overflow:hidden;}
      .sk-collapsible > .sk-collapse-hd{margin-bottom:0 !important;min-height:74px;align-items:center;cursor:pointer;user-select:none;border-radius:12px;transition:background .16s ease,margin .2s ease,padding .2s ease;}
      .sk-collapsible > .sk-collapse-hd:hover{background:var(--surface2);}
      .sk-collapsible > .sk-collapse-hd:focus-visible{outline:3px solid var(--primary-soft);outline-offset:2px;}
      .sk-collapsible.is-expanded > .sk-collapse-hd{margin-bottom:14px !important;}
      .sk-collapsible.is-collapsed > :not(.sk-collapse-hd){display:none !important;}
      .sk-summary-main{display:flex;align-items:center;gap:12px;min-width:0;}
      .sk-summary-icon{width:42px;height:42px;flex:0 0 42px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:21px;font-weight:800;}
      .sk-icon-task{background:var(--primary-soft);color:var(--primary);}
      .sk-icon-note{background:var(--amber-soft);color:var(--amber);font-size:23px;}
      .sk-summary-copy{min-width:0;}
      .sk-summary-title{font-size:14px;font-weight:750;color:var(--ink);line-height:1.15;}
      .sk-summary-value{font-size:18px;color:var(--ink);line-height:1.2;margin-top:2px;letter-spacing:-.02em;}
      .sk-summary-value strong{font-weight:800;}
      .sk-summary-meta{font-size:11px;color:var(--ink2);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:360px;}
      .sk-progress{width:min(180px,42vw);height:5px;background:var(--surface3);border-radius:99px;overflow:hidden;margin-top:7px;}
      .sk-progress span{display:block;height:100%;background:var(--primary);border-radius:inherit;transition:width .25s ease;}
      .sk-summary-right{margin-left:auto;display:flex;align-items:center;padding-left:10px;}
      .sk-chevron{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--surface2);color:var(--ink2);font-size:20px;line-height:1;transition:transform .2s ease,background .16s ease;color .16s ease;}
      .sk-collapse-hd:hover .sk-chevron{background:var(--primary-soft);color:var(--primary);}
      .sk-collapsible.is-expanded .sk-chevron{transform:translateY(-1px);}
      .sk-collapsible.is-expanded > .sk-collapse-hd{padding-bottom:2px;}
      @media(max-width:700px){
        .sk-collapsible > .sk-collapse-hd{min-height:70px;padding:4px 2px !important;}
        .sk-summary-icon{width:40px;height:40px;flex-basis:40px;border-radius:12px;}
        .sk-summary-value{font-size:17px;}
        .sk-summary-meta{font-size:10px;max-width:220px;}
        .sk-progress{width:150px;}
        .sk-collapsible.is-expanded > .sk-collapse-hd{margin-bottom:10px !important;}
        #taskList{max-height:300px !important;height:300px !important;overflow-y:auto !important;overflow-x:hidden !important;-webkit-overflow-scrolling:touch !important;overscroll-behavior:contain !important;}
        #notesList{max-height:270px !important;height:270px !important;overflow-y:auto !important;overflow-x:hidden !important;-webkit-overflow-scrolling:touch !important;overscroll-behavior:contain !important;}
        #taskList .titem,#notesList .nitem{flex:0 0 auto !important;}
      }
      @media(max-width:380px){
        .sk-summary-icon{width:36px;height:36px;flex-basis:36px;font-size:18px;}
        .sk-summary-main{gap:9px;}
        .sk-summary-value{font-size:16px;}
        .sk-summary-meta{max-width:180px;}
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    bindTaskCompletion();
    injectStyles();
    bindAccordions();
    observeChanges();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
