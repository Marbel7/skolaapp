/* SkolaApp — reliable task interactions + collapsed mobile task card */
(function () {
  'use strict';

  function arr() {
    return Array.isArray(window.tasks) ? window.tasks : [];
  }

  function render() {
    if (typeof window.renderTasks === 'function') window.renderTasks();
    if (typeof window.calRender === 'function') window.calRender();
    refreshSummary();
  }

  function refreshSummary() {
    var tasks = arr();
    var done = tasks.filter(function (t) { return !!t.done; }).length;
    var total = tasks.length;
    var d = document.getElementById('skTaskDone');
    var t = document.getElementById('skTaskTotal');
    var p = document.getElementById('skTaskProgress');
    var m = document.getElementById('skTaskMeta');
    if (d) d.textContent = done;
    if (t) t.textContent = total;
    if (p) p.style.width = (total ? Math.round(done / total * 100) : 0) + '%';
    if (m) m.textContent = total - done ? (total - done) + ' zbývá' : (total ? 'Všechno hotovo' : 'Zatím žádné úkoly');
  }

  function toggleTask(index) {
    var tasks = arr();
    var i = Number(index);
    if (!Number.isInteger(i) || !tasks[i]) return;
    var task = tasks[i];
    var old = !!task.done;
    task.done = !old;
    render();

    if (window.fbSyncEnabled && task.id && typeof window.fbToggleTask === 'function') {
      Promise.resolve(window.fbToggleTask(task.id, task.done)).catch(function (err) {
        task.done = old;
        render();
        if (typeof window.showToast === 'function') window.showToast('⚠️ Nepodařilo se uložit úkol');
        console.error('[SKOLA task toggle]', err);
      });
    } else if (typeof window.saveTasks === 'function') {
      window.saveTasks();
    }
  }

  function bindCheckboxes() {
    if (document.__skTaskClicks) return;
    document.__skTaskClicks = true;
    document.addEventListener('click', function (e) {
      var el = e.target && e.target.closest ? e.target.closest('#taskList [data-action="check"], #taskList .tck') : null;
      if (!el) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      toggleTask(el.getAttribute('data-i'));
    }, true);
  }

  function findTaskInput() {
    return document.getElementById('taskInput') || (document.querySelector('#taskList') && document.querySelector('.ti'));
  }

  function findTaskAddButton() {
    return document.getElementById('taskAddBtn') || document.querySelector('.tadd');
  }

  function addTypedTask(input) {
    if (!input) return;
    var value = String(input.value || '').trim();
    if (!value) { input.focus(); return; }

    if (typeof window.addTask === 'function') {
      try {
        window.addTask();
        setTimeout(render, 50);
        return;
      } catch (err) {
        console.error('[SKOLA addTask fallback]', err);
      }
    }

    var priorityEl = document.getElementById('taskPriority') || document.querySelector('.psel');
    var task = { text: value, priority: priorityEl && priorityEl.value ? priorityEl.value : 'med', done: false, createdAt: new Date().toISOString() };
    window.tasks = arr();
    window.tasks.unshift(task);
    input.value = '';

    if (window.fbSyncEnabled && typeof window.fbAddTask === 'function') {
      Promise.resolve(window.fbAddTask(task)).then(render).catch(function (err) { console.error('[SKOLA fbAddTask]', err); render(); });
    } else {
      if (typeof window.saveTasks === 'function') window.saveTasks();
      render();
    }
  }

  function bindTaskEntry() {
    if (document.__skTaskEntry) return;
    document.__skTaskEntry = true;

    document.addEventListener('click', function (e) {
      var button = e.target && e.target.closest ? e.target.closest('#taskAddBtn, .tadd') : null;
      if (!button) return;
      var input = findTaskInput();
      if (!input) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      addTypedTask(input);
    }, true);

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var input = e.target && e.target.closest ? e.target.closest('#taskInput, .ti') : null;
      if (!input) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      addTypedTask(input);
    }, true);
  }

  function bindCapture() {
    if (document.__skCaptureTaskFix) return;
    document.__skCaptureTaskFix = true;

    document.addEventListener('input', function (e) {
      var text = e.target && e.target.closest ? e.target.closest('#sk-text') : null;
      if (!text) return;
      var save = document.getElementById('sk-save');
      if (save) save.disabled = !text.value.trim();
    }, true);

    document.addEventListener('click', function (e) {
      var save = e.target && e.target.closest ? e.target.closest('#sk-save') : null;
      if (!save) return;
      var mode = document.getElementById('sk-task');
      var text = document.getElementById('sk-text');
      if (!mode || !mode.classList.contains('active') || !text || !text.value.trim()) return;

      e.preventDefault();
      e.stopImmediatePropagation();
      var value = text.value.trim();
      var priorityEl = document.getElementById('taskPriority') || document.querySelector('.psel');
      var task = { text: value, priority: priorityEl && priorityEl.value ? priorityEl.value : 'med', done: false, createdAt: new Date().toISOString() };

      function finish() {
        text.value = '';
        save.disabled = true;
        var overlay = document.querySelector('.sk-capture');
        if (overlay) overlay.classList.remove('open');
        render();
      }

      if (window.fbSyncEnabled && typeof window.fbAddTask === 'function') {
        Promise.resolve(window.fbAddTask(task)).then(finish).catch(function (err) {
          console.error('[SKOLA capture fbAddTask]', err);
          if (typeof window.showToast === 'function') window.showToast('⚠️ Úkol se nepodařilo uložit');
        });
      } else {
        window.tasks = arr();
        window.tasks.unshift(task);
        if (typeof window.saveTasks === 'function') window.saveTasks();
        finish();
      }
    }, true);
  }

  function injectAccordionStyles() {
    if (document.getElementById('sk-task-collapse-styles')) return;
    var style = document.createElement('style');
    style.id = 'sk-task-collapse-styles';
    style.textContent = `
      @media(max-width:700px){
        #page-dashboard .sk-task-collapsible{overflow:hidden!important;}
        #page-dashboard .sk-task-collapsible.is-collapsed > :not(.sk-task-summary){display:none!important;}
        #page-dashboard .sk-task-summary{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;min-height:76px!important;margin:0!important;padding:4px 2px!important;cursor:pointer!important;user-select:none!important;}
        #page-dashboard .sk-task-summary-main{display:flex!important;align-items:center!important;gap:12px!important;min-width:0!important;}
        #page-dashboard .sk-task-summary-icon{width:46px!important;height:46px!important;flex:0 0 46px!important;border-radius:14px!important;background:#F0EEFF!important;color:#6C5CE7!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:24px!important;font-weight:800!important;}
        #page-dashboard .sk-task-summary-title{font-size:14px!important;font-weight:800!important;color:#202033!important;line-height:1.15!important;}
        #page-dashboard .sk-task-summary-value{font-size:19px!important;font-weight:700!important;color:#202033!important;margin-top:3px!important;}
        #page-dashboard .sk-task-summary-meta{font-size:11px!important;color:#7C8198!important;margin-top:4px!important;}
        #page-dashboard .sk-task-summary-progress{width:150px!important;height:5px!important;background:#EDEDF3!important;border-radius:99px!important;overflow:hidden!important;margin-top:6px!important;}
        #page-dashboard .sk-task-summary-progress span{display:block!important;height:100%!important;background:#6C5CE7!important;border-radius:99px!important;}
        #page-dashboard .sk-task-summary-chevron{width:34px!important;height:34px!important;flex:0 0 34px!important;border-radius:50%!important;background:#F4F4F8!important;color:#7C8198!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:20px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function setupTaskSummary(card) {
    if (!card || card.__skTaskAccordion) return;
    var originalHeader = card.querySelector('.card-hd');
    if (!originalHeader) return;
    card.__skTaskAccordion = true;
    card.classList.add('sk-task-collapsible', 'is-collapsed');

    var header = document.createElement('div');
    header.className = 'sk-task-summary';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('aria-controls', 'taskList');
    header.innerHTML =
      '<div class="sk-task-summary-main">' +
        '<div class="sk-task-summary-icon">✓</div>' +
        '<div>' +
          '<div class="sk-task-summary-title">Úkoly</div>' +
          '<div class="sk-task-summary-value"><strong id="skTaskDone">0</strong> / <span id="skTaskTotal">0</span> splněno</div>' +
          '<div class="sk-task-summary-progress"><span id="skTaskProgress" style="width:0%"></span></div>' +
          '<div class="sk-task-summary-meta" id="skTaskMeta">Zatím žádné úkoly</div>' +
        '</div>' +
      '</div>' +
      '<div class="sk-task-summary-chevron">⌄</div>';

    originalHeader.replaceWith(header);

    function toggle() {
      var open = card.classList.contains('is-expanded');
      card.classList.toggle('is-expanded', !open);
      card.classList.toggle('is-collapsed', open);
      header.setAttribute('aria-expanded', open ? 'false' : 'true');
      var chev = header.querySelector('.sk-task-summary-chevron');
      if (chev) chev.textContent = open ? '⌄' : '⌃';
    }

    header.addEventListener('click', function (e) {
      if (e.target.closest('button,input,select,textarea,a')) return;
      toggle();
    });
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    refreshSummary();
  }

  function bindAccordion() {
    injectAccordionStyles();
    var list = document.getElementById('taskList');
    var card = list && list.closest('.card');
    if (card) setupTaskSummary(card);
  }

  function init() {
    bindCheckboxes();
    bindTaskEntry();
    bindCapture();
    bindAccordion();
    refreshSummary();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  setTimeout(init, 250);
  setTimeout(init, 1000);
  setTimeout(init, 2000);
})();