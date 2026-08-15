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

/* ── Dashboard Design Pass 01 ───────────────────────────────────────────
   Visual-only layer. Existing DOM, data and navigation remain untouched. */
(function () {
  'use strict';
  var style = document.createElement('style');
  style.id = 'sk-dashboard-design-pass-01';
  style.textContent = `
    /* Page rhythm */
    .page {
      max-width: 1120px !important;
      padding: 2.35rem 2rem 5rem !important;
    }
    .page-hdr {
      position: relative;
      margin-bottom: 1.75rem !important;
      padding: 0 2px 2px;
    }
    .page-hdr h1 {
      font-size: clamp(24px, 3vw, 30px) !important;
      font-weight: 750 !important;
      letter-spacing: -.035em !important;
      line-height: 1.15 !important;
    }
    .page-hdr p {
      font-size: 13px !important;
      color: var(--ink2) !important;
      margin-top: 7px !important;
    }

    /* Stats become calm, useful information blocks */
    .stats {
      gap: 14px !important;
      margin-bottom: 16px !important;
    }
    .stat {
      position: relative;
      overflow: hidden;
      min-height: 112px;
      padding: 17px 18px !important;
      border-radius: 16px !important;
      box-shadow: 0 1px 2px rgba(32,32,51,.035), 0 8px 24px rgba(32,32,51,.045) !important;
      transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;
    }
    .stat::after {
      content: '';
      position: absolute;
      width: 82px;
      height: 82px;
      right: -28px;
      top: -28px;
      border-radius: 50%;
      background: var(--primary-soft);
      opacity: .7;
      pointer-events: none;
    }
    .stat:hover {
      transform: translateY(-2px);
      border-color: var(--border2) !important;
      box-shadow: 0 8px 26px rgba(32,32,51,.08) !important;
    }
    .stat-lbl { font-size: 10px !important; letter-spacing: .09em !important; }
    .stat-val { font-size: 28px !important; }
    .stat-sub { font-size: 11px !important; color: var(--ink2) !important; }

    /* Cards */
    .grid2 { gap: 14px !important; margin-bottom: 14px !important; }
    .card {
      border-radius: 16px !important;
      padding: 17px 18px !important;
      box-shadow: 0 1px 2px rgba(32,32,51,.035), 0 8px 24px rgba(32,32,51,.04) !important;
    }
    .card-hd { margin-bottom: 14px !important; }
    .card-ttl { font-size: 14px !important; font-weight: 700 !important; letter-spacing: -.01em; }
    .card-sub { font-size: 11px !important; color: var(--ink2) !important; }
    .badge { padding: 5px 9px !important; font-size: 9px !important; letter-spacing: .03em; }

    /* Quick links */
    .lgrid { gap: 9px !important; }
    .lbtn {
      min-height: 58px;
      padding: 10px 12px !important;
      border-radius: 13px !important;
      transition: transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease !important;
    }
    .lbtn:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 7px 18px rgba(32,32,51,.07) !important;
    }
    .li { width: 34px !important; height: 34px !important; border-radius: 10px !important; }
    .ln { font-size: 12px !important; }
    .ld { font-size: 10px !important; color: var(--ink2) !important; }

    /* Tasks / notes: clearer rows and stronger affordances */
    .ti-row { margin-bottom: 10px !important; }
    .tadd { width: 40px; min-width: 40px; padding: 0 !important; font-size: 20px !important; }
    .titem, .nitem, .mitem, .eitem {
      min-height: 42px;
      border-radius: 11px !important;
      padding: 9px 10px !important;
      background: var(--surface) !important;
    }
    .titem.done { background: var(--surface2) !important; }
    .tck { width: 20px !important; height: 20px !important; flex-basis: 20px !important; border-radius: 6px !important; }
    .tck.checked { box-shadow: 0 2px 7px rgba(108,92,231,.22); }
    .ttxt { font-size: 12px !important; line-height: 1.35 !important; }
    .tprio { font-size: 9px !important; padding: 3px 7px !important; }
    .tdel { width: 26px; height: 26px; border-radius: 7px; }
    .tdel:hover { background: var(--red-soft); color: var(--red); }

    /* Inputs */
    .search-input, .field, .sinput, .ninput, .file-input, .ti, .psel {
      border-radius: 10px !important;
    }
    .search-input:focus, .field:focus, .sinput:focus, .ninput:focus, .file-input:focus, .ti:focus, .psel:focus {
      box-shadow: 0 0 0 3px rgba(108,92,231,.09) !important;
    }

    /* Desktop spacing */
    @media (min-width: 841px) {
      .page.active .page-hdr { animation: skFadeIn .28s ease both; }
      .page.active .stat { animation: skFadeIn .32s ease both; }
      .page.active .grid2 { animation: skFadeIn .38s ease both; }
    }
    @keyframes skFadeIn { from { opacity: .55; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

    /* Mobile: keep the new hierarchy without wasting vertical space */
    @media (max-width: 700px) {
      .page { padding: 1.15rem 12px 3.5rem !important; }
      .page-hdr { margin-bottom: 1rem !important; padding: 0 2px !important; }
      .page-hdr h1 { font-size: 23px !important; }
      .page-hdr p { font-size: 12px !important; margin-top: 5px !important; }
      .stats { gap: 8px !important; margin-bottom: 10px !important; }
      .stat { min-height: 92px; padding: 13px 13px !important; border-radius: 14px !important; }
      .stat-val { font-size: 22px !important; }
      .stat-lbl { font-size: 9px !important; margin-bottom: 5px !important; }
      .stat-sub { font-size: 9px !important; }
      .grid2 { gap: 10px !important; margin-bottom: 10px !important; }
      .card { padding: 14px !important; border-radius: 14px !important; }
      .card-hd { margin-bottom: 11px !important; }
      .card-ttl { font-size: 13px !important; }
      .lgrid { grid-template-columns: 1fr !important; }
      .lbtn { min-height: 54px; }
      .ladd { min-height: 42px; }
      .titem { min-height: 44px; }
      .tdel { opacity: 1 !important; }
    }
  `;
  (document.head || document.documentElement).appendChild(style);
})();
