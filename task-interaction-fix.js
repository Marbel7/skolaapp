/* SkolaApp — robust task completion interaction
   Uses capture phase so the existing renderer/data model stays intact.
   Only intercepts task check/text taps; delete actions keep their existing handler. */
(function () {
  'use strict';

  function bind() {
    var list = document.getElementById('taskList');
    if (!list || list.__taskInteractionFix) return;
    list.__taskInteractionFix = true;

    list.addEventListener('click', function (e) {
      var el = e.target.closest('[data-action="check"]');
      if (!el || !list.contains(el)) return;

      // Take ownership of the check interaction so the original listener
      // cannot toggle the same task a second time.
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }
})();
