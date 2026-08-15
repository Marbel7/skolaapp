/* SkolaApp — reliable mobile task + accordion interactions */
(function () {
  'use strict';

  function taskState() {
    var list = Array.isArray(window.tasks) ? window.tasks : [];
    var done = list.filter(function (t) { return !!t.done; }).length;
    return { tasks: list, total: list.length, done: done, remaining: Math.max(0, list.length - done), percent: list.length ? Math.round(done / list.length * 100) : 0 };
  }

  function taskCard() {
    var list = document.getElementById('taskList');
    return list ? list.closest('.card') : null;
  }

  function noteCard() {
    var list = document.getElementById('notesList');
    return list ? list.closest('.card') : null;
  }

  function escapeText(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function latestNote() {
    var notes = Array.isArray(window.notes) ? window.notes : [];
    if (!notes.length) return 'Žádná uložená poznámka';
    var text = String(notes[0].text || '').trim().replace(/\s+/g, ' ');
    return text ? (text.length > 54 ? text.slice(0, 54) + '…' : text) : 'Poslední uložená poznámka';
  }

  function taskHeader(card) {
    var header = card.querySelector('.card-hd');
    if (!header) return;
    var s = taskState();
    header.className = 'card-hd sk-collapse-hd';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-controls', 'taskList');
    header.innerHTML =
      '<div class="sk-summary-main"><div class="sk-summary-icon sk-icon-task">✓</div>' +
      '<div class="sk-summary-copy"><div class="sk-summary-title">Úkoly</div>' +
      '<div class="sk-summary-value"><strong id="skTaskDone">' + s.done + '</strong> / <span id="skTaskTotal">' + s.total + '</span> splněno</div>' +
      '<div class="sk-progress"><span id="skTaskProgress" style="width:' + s.percent + '%"></span></div>' +
      '<div class="sk-summary-meta" id="skTaskMeta">' + (s.remaining ? s.remaining + ' zbývá' : (s.total ? 'Všechno hotovo' : 'Zatím žádné úkoly')) + '</div></div></div>' +
      '<div class="sk-summary-right"><span class="sk-chevron">⌄</span></div>';
  }

  function noteHeader(card) {
    var header = card.querySelector('.card-hd');
    if (!header) return;
    var notes = Array.isArray(window.notes) ? window.notes : [];
    header.className = 'card-hd sk-collapse-hd';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-controls', 'notesList');
    header.innerHTML =
      '<div class="sk-summary-main"><div class="sk-summary-icon sk-icon-note">✎</div>' +
      '<div class="sk-summary-copy"><div class="sk-summary-title">Poznámky</div>' +
      '<div class="sk-summary-value"><strong id="skNotesTotal">' + notes.length + '</strong> uložených</div>' +
      '<div class="sk-summary-meta" id="skNotesMeta">' + escapeText(latestNote()) + '</div></div></div>' +
      '<div class="sk-summary-right"><span class="sk-chevron">⌄</span></div>';
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
    if (!card || card.__skAccordionFixed) return;
    card.__skAccordionFixed = true;
    card.classList.add('sk-collapsible', 'is-collapsed');
    if (kind === 'tasks') taskHeader(card); else noteHeader(card);
    var header = card.querySelector('.sk-collapse-hd');
    if (!header) return;
    function toggle() { setExpanded(card, !card.classList.contains('is-expanded')); }
    header.addEventListener('click', function (e) {
      if (e.target.closest('button,input,select,textarea,a')) return;
      toggle();
    });
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }

  function refreshSummary() {
    var s = taskState();
    var done = document.getElementById('skTaskDone');
    var total = document.getElementById('skTaskTotal');
    var progress = document.getElementById('skTaskProgress');
    var meta = document.getElementById('skTaskMeta');
    if (done) done.textContent = s.done;
    if (total) total.textContent = s.total;
    if (progress) progress.style.width = s.percent + '%';
    if (meta) meta.textContent = s.remaining ? s.remaining + ' zbývá' : (s.total ? 'Všechno hotovo' : 'Zatím žádné úkoly');
    var nt = document.getElementById('skNotesTotal');
    var nm = document.getElementById('skNotesMeta');
    if (nt) nt.textContent = Array.isArray(window.notes) ? window.notes.length : 0;
    if (nm) nm.textContent = latestNote();
  }

  /* Reliable checkbox handler. Uses capture phase so the original handler cannot swallow the tap. */
  function bindCheckboxes() {
    var list = document.getElementById('taskList');
    if (!list || list.__mobileCheckboxFix) return;
    list.__mobileCheckboxFix = true;
    list.addEventListener('click', function (e) {
      var el = e.target.closest('[data-action="check"]');
      if (!el || !list.contains(el)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      var i = parseInt(el.dataset.i, 10);
      var arr = Array.isArray(window.tasks) ? window.tasks : [];
      if (!Number.isInteger(i) || !arr[i]) return;
      var task = arr[i];
      var previous = !!task.done;
      task.done = !previous;
      if (typeof window.renderTasks === 'function') window.renderTasks();
      if (typeof window.calRender === 'function') window.calRender();
      if (window.fbSyncEnabled && task.id && typeof window.fbToggleTask === 'function') {
        var id = task.id;
        if (window.fbPendingTaskToggles) window.fbPendingTaskToggles[id] = task.done;
        window.fbToggleTask(id, task.done).then(function () {
          if (window.fbPendingTaskToggles) delete window.fbPendingTaskToggles[id];
        }).catch(function (err) {
          if (window.fbPendingTaskToggles) delete window.fbPendingTaskToggles[id];
          var current = arr.find(function (t) { return t.id === id; });
          if (current) current.done = previous;
          if (typeof window.renderTasks === 'function') window.renderTasks();
          if (typeof window.calRender === 'function') window.calRender();
          if (typeof window.showToast === 'function') window.showToast('⚠️ Nepodařilo se uložit úkol');
          console.error('[mobile task checkbox]', err);
        });
      } else if (typeof window.saveTasks === 'function') {
        window.saveTasks();
      }
      refreshSummary();
    }, true);
  }

  /* Direct task entry on the dashboard. */
  function bindTaskEntry() {
    var input = document.getElementById('taskInput');
    var button = document.getElementById('taskAddBtn');
    if (!input || !button || button.__mobileTaskEntryFix) return;
    button.__mobileTaskEntryFix = true;
    function addFromInput(e) {
      if (e) { e.preventDefault(); e.stopImmediatePropagation(); }
      var value = input.value.trim();
      if (!value) { input.focus(); return; }
      if (typeof window.addTask === 'function') {
        window.addTask();
      } else {
        var arr = Array.isArray(window.tasks) ? window.tasks : [];
        var priority = (document.getElementById('taskPriority') || {}).value || 'med';
        var task = {text:value, priority:priority, done:false, createdAt:new Date().toISOString()};
        arr.unshift(task); window.tasks = arr;
        if (typeof window.saveTasks === 'function') window.saveTasks();
        if (typeof window.renderTasks === 'function') window.renderTasks();
      }
      refreshSummary();
    }
    button.addEventListener('click', addFromInput, true);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); addFromInput(); }
    }, true);
  }

  /* Directly handle the "Uložit" button in the quick-capture sheet for typed tasks. */
  function bindCaptureSave() {
    var save = document.getElementById('sk-save');
    if (!save || save.__mobileCaptureFix) return;
    save.__mobileCaptureFix = true;
    save.addEventListener('click', function (e) {
      var modeBtn = document.getElementById('sk-task');
      var text = document.getElementById('sk-text');
      var modeIsTask = modeBtn && modeBtn.classList.contains('active');
      if (!modeIsTask || !text || !text.value.trim()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      var value = text.value.trim();
      var input = document.getElementById('taskInput');
      var arr = Array.isArray(window.tasks) ? window.tasks : [];
      var priorityEl = document.getElementById('taskPriority');
      var task = {text:value, priority:priorityEl ? priorityEl.value : 'med', done:false, createdAt:new Date().toISOString()};
      if (window.fbSyncEnabled && typeof window.fbAddTask === 'function') {
        window.fbAddTask(task);
      } else {
        arr.unshift(task);
        window.tasks = arr;
        if (typeof window.saveTasks === 'function') window.saveTasks();
        if (typeof window.renderTasks === 'function') window.renderTasks();
        if (typeof window.calRender === 'function') window.calRender();
      }
      if (input) input.value = '';
      var overlay = document.querySelector('.sk-capture');
      if (overlay) overlay.classList.remove('open');
      text.value = '';
      refreshSummary();
    }, true);
  }

  function injectStyles() {
    if (document.getElementById('sk-dashboard-accordion-styles')) return;
    var style = document.createElement('style');
    style.id = 'sk-dashboard-accordion-styles';
    style.textContent = `
      .sk-collapsible{overflow:hidden;}
      .sk-collapsible>.sk-collapse-hd{margin-bottom:0!important;min-height:74px;align-items:center;cursor:pointer;user-select:none;border-radius:12px;transition:background .16s ease,margin .2s ease,padding .2s ease;}
      .sk-collapsible>.sk-collapse-hd:hover{background:var(--surface2);}
      .sk-collapsible.is-expanded>.sk-collapse-hd{margin-bottom:14px!important;}
      .sk-collapsible.is-collapsed>:not(.sk-collapse-hd){display:none!important;}
      .sk-summary-main{display:flex;align-items:center;gap:12px;min-width:0;}
      .sk-summary-icon{width:42px;height:42px;flex:0 0 42px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:21px;font-weight:800;}
      .sk-icon-task{background:var(--primary-soft);color:var(--primary);}.sk-icon-note{background:var(--amber-soft);color:var(--amber);font-size:23px;}
      .sk-summary-copy{min-width:0;}.sk-summary-title{font-size:14px;font-weight:750;color:var(--ink);line-height:1.15;}
      .sk-summary-value{font-size:18px;color:var(--ink);line-height:1.2;margin-top:2px;letter-spacing:-.02em;}.sk-summary-value strong{font-weight:800;}
      .sk-summary-meta{font-size:11px;color:var(--ink2);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:360px;}
      .sk-progress{width:min(180px,42vw);height:5px;background:var(--surface3);border-radius:99px;overflow:hidden;margin-top:7px;}.sk-progress span{display:block;height:100%;background:var(--primary);border-radius:inherit;transition:width .25s ease;}
      .sk-summary-right{margin-left:auto;display:flex;align-items:center;padding-left:10px;}.sk-chevron{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--surface2);color:var(--ink2);font-size:20px;line-height:1;}
      .sk-collapsible.is-expanded>.sk-collapse-hd{padding-bottom:2px;}
      @media(max-width:700px){
        .sk-collapsible>.sk-collapse-hd{min-height:70px;padding:4px 2px!important;}
        .sk-summary-icon{width:40px;height:40px;flex-basis:40px;border-radius:12px;}.sk-summary-value{font-size:17px;}.sk-summary-meta{font-size:10px;max-width:220px;}.sk-progress{width:150px;}
        #taskList{max-height:300px!important;height:300px!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;}
        #notesList{max-height:270px!important;height:270px!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;}
        #taskList .titem,#notesList .nitem{flex:0 0 auto!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    var tc = taskCard(), nc = noteCard();
    if (tc) bindAccordion(tc, 'tasks');
    if (nc) bindAccordion(nc, 'notes');
    bindCheckboxes();
    bindTaskEntry();
    bindCaptureSave();
    injectStyles();
    refreshSummary();
    var list = document.getElementById('taskList');
    if (list && !list.__mobileSummaryObserver) {
      list.__mobileSummaryObserver = new MutationObserver(refreshSummary);
      list.__mobileSummaryObserver.observe(list, {childList:true, subtree:true, attributes:true});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
  setTimeout(init, 300);
  setTimeout(init, 1200);
})();
