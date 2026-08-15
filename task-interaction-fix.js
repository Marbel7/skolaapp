/* SkolaApp — reliable task interactions (loaded by mobile-enhancement.js) */
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
    return document.getElementById('taskInput') || document.querySelector('#taskList') && document.querySelector('.ti');
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
    var task = {
      text: value,
      priority: priorityEl && priorityEl.value ? priorityEl.value : 'med',
      done: false,
      createdAt: new Date().toISOString()
    };
    window.tasks = arr();
    window.tasks.unshift(task);
    input.value = '';

    if (window.fbSyncEnabled && typeof window.fbAddTask === 'function') {
      Promise.resolve(window.fbAddTask(task)).then(render).catch(function (err) {
        console.error('[SKOLA fbAddTask]', err);
        render();
      });
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
      var task = {
        text: value,
        priority: priorityEl && priorityEl.value ? priorityEl.value : 'med',
        done: false,
        createdAt: new Date().toISOString()
      };

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

  function bindAccordion() {
    var card = document.getElementById('taskList');
    card = card && card.closest('.card');
    if (!card || card.__skTaskAccordion) return;
    card.__skTaskAccordion = true;
    var header = card.querySelector('.card-hd');
    if (!header) return;
    header.addEventListener('click', function (e) {
      if (e.target.closest('button,input,select,textarea,a')) return;
      card.classList.toggle('is-expanded');
      card.classList.toggle('is-collapsed');
      var open = card.classList.contains('is-expanded');
      header.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function init() {
    bindCheckboxes();
    bindTaskEntry();
    bindCapture();
    bindAccordion();
    refreshSummary();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
  setTimeout(init, 250);
  setTimeout(init, 1000);
})();