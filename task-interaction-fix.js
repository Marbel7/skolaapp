/* SkolaApp — reliable task interactions + dashboard accordions */
(function () {
  'use strict';

  function arr() { return Array.isArray(window.tasks) ? window.tasks : []; }

  function render() {
    if (typeof window.renderTasks === 'function') window.renderTasks();
    if (typeof window.calRender === 'function') window.calRender();
    if (typeof window.renderNotes === 'function') window.renderNotes();
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
    if (m) m.textContent = total ? ((total - done) ? (total - done) + ' zbývá' : 'Všechno hotovo') : 'Zatím žádné úkoly';
  }

  function toggleTask(index) {
    var tasks = arr(), i = Number(index);
    if (!Number.isInteger(i) || !tasks[i]) return;
    var task = tasks[i], old = !!task.done;
    task.done = !old;
    render();
    if (window.fbSyncEnabled && task.id && typeof window.fbToggleTask === 'function') {
      Promise.resolve(window.fbToggleTask(task.id, task.done)).catch(function (err) {
        task.done = old; render();
        if (typeof window.showToast === 'function') window.showToast('⚠️ Nepodařilo se uložit úkol');
        console.error('[SKOLA task toggle]', err);
      });
    } else if (typeof window.saveTasks === 'function') window.saveTasks();
  }

  function bindCheckboxes() {
    if (document.__skTaskClicks) return;
    document.__skTaskClicks = true;
    document.addEventListener('click', function (e) {
      var el = e.target && e.target.closest ? e.target.closest('#taskList [data-action="check"], #taskList .tck') : null;
      if (!el) return;
      e.preventDefault(); e.stopImmediatePropagation();
      toggleTask(el.getAttribute('data-i'));
    }, true);
  }

  function findTaskInput() { return document.getElementById('taskInput') || document.querySelector('.ti'); }

  function addTypedTask(input) {
    if (!input) return;
    var value = String(input.value || '').trim();
    if (!value) { input.focus(); return; }
    if (typeof window.addTask === 'function') {
      try { window.addTask(); setTimeout(refreshSummary, 80); return; }
      catch (err) { console.error('[SKOLA addTask]', err); }
    }
    var priorityEl = document.getElementById('taskPriority') || document.querySelector('.psel');
    var task = { text:value, priority:priorityEl && priorityEl.value ? priorityEl.value : 'med', done:false, createdAt:new Date().toISOString() };
    window.tasks = arr(); window.tasks.unshift(task); input.value = '';
    if (window.fbSyncEnabled && typeof window.fbAddTask === 'function') Promise.resolve(window.fbAddTask(task)).then(render);
    else { if (typeof window.saveTasks === 'function') window.saveTasks(); render(); }
  }

  function bindTaskEntry() {
    if (document.__skTaskEntry) return;
    document.__skTaskEntry = true;
    document.addEventListener('click', function (e) {
      var button = e.target && e.target.closest ? e.target.closest('#taskAddBtn, .tadd') : null;
      if (!button) return;
      var input = findTaskInput(); if (!input) return;
      e.preventDefault(); e.stopImmediatePropagation(); addTypedTask(input);
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var input = e.target && e.target.closest ? e.target.closest('#taskInput, .ti') : null;
      if (!input) return;
      e.preventDefault(); e.stopImmediatePropagation(); addTypedTask(input);
    }, true);
  }

  function bindCapture() {
    if (document.__skCaptureTaskFix) return;
    document.__skCaptureTaskFix = true;
    document.addEventListener('input', function (e) {
      var text = e.target && e.target.closest ? e.target.closest('#sk-text') : null;
      if (!text) return;
      var save = document.getElementById('sk-save'); if (save) save.disabled = !text.value.trim();
    }, true);
    document.addEventListener('click', function (e) {
      var save = e.target && e.target.closest ? e.target.closest('#sk-save') : null;
      if (!save) return;
      var mode = document.getElementById('sk-task'), text = document.getElementById('sk-text');
      if (!mode || !mode.classList.contains('active') || !text || !text.value.trim()) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var value = text.value.trim();
      var priorityEl = document.getElementById('taskPriority') || document.querySelector('.psel');
      var task = { text:value, priority:priorityEl && priorityEl.value ? priorityEl.value : 'med', done:false, createdAt:new Date().toISOString() };
      function finish(){ text.value=''; save.disabled=true; var overlay=document.querySelector('.sk-capture'); if(overlay) overlay.classList.remove('open'); render(); }
      if (window.fbSyncEnabled && typeof window.fbAddTask === 'function') Promise.resolve(window.fbAddTask(task)).then(finish).catch(function(err){ console.error(err); if(typeof window.showToast==='function') window.showToast('⚠️ Úkol se nepodařilo uložit'); });
      else { window.tasks=arr(); window.tasks.unshift(task); if(typeof window.saveTasks==='function') window.saveTasks(); finish(); }
    }, true);
  }

  function injectStyles() {
    if (document.getElementById('sk-dashboard-accordion-styles')) return;
    var style=document.createElement('style'); style.id='sk-dashboard-accordion-styles';
    style.textContent=`
      @media(max-width:700px){
        #page-dashboard .sk-task-collapsible,#page-dashboard .sk-note-collapsible{overflow:hidden!important;}
        #page-dashboard .sk-task-summary,#page-dashboard .sk-note-summary{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;min-height:76px!important;margin:0!important;padding:4px 2px!important;cursor:pointer!important;user-select:none!important;-webkit-tap-highlight-color:transparent!important;}
        #page-dashboard .sk-summary-main{display:flex!important;align-items:center!important;gap:12px!important;min-width:0!important;}
        #page-dashboard .sk-summary-icon{width:46px!important;height:46px!important;flex:0 0 46px!important;border-radius:14px!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:23px!important;font-weight:800!important;}
        #page-dashboard .sk-task-summary-icon{background:#F0EEFF!important;color:#6C5CE7!important;}
        #page-dashboard .sk-note-summary-icon{background:#FFF7EC!important;color:#F2A93B!important;}
        #page-dashboard .sk-summary-title{font-size:14px!important;font-weight:800!important;color:#202033!important;line-height:1.15!important;}
        #page-dashboard .sk-summary-value{font-size:19px!important;font-weight:700!important;color:#202033!important;margin-top:3px!important;}
        #page-dashboard .sk-summary-meta{font-size:11px!important;color:#7C8198!important;margin-top:4px!important;max-width:270px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
        #page-dashboard .sk-summary-progress{width:150px!important;height:5px!important;background:#EDEDF3!important;border-radius:99px!important;overflow:hidden!important;margin-top:6px!important;}
        #page-dashboard .sk-summary-progress span{display:block!important;height:100%!important;background:#6C5CE7!important;border-radius:99px!important;}
        #page-dashboard .sk-summary-chevron{width:34px!important;height:34px!important;flex:0 0 34px!important;border-radius:50%!important;background:#F4F4F8!important;color:#7C8198!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:20px!important;}
        /* Task list/search stay hidden when collapsed, but the add-task row remains usable. */
        #page-dashboard .sk-task-collapsible.is-collapsed #taskSearch,
        #page-dashboard .sk-task-collapsible.is-collapsed .toolbar-row{display:none!important;}
        #page-dashboard .sk-task-collapsible.is-collapsed #taskList{display:none!important;}
        #page-dashboard .sk-task-collapsible.is-expanded #taskList{display:flex!important;}
        /* Notes are fully compact when collapsed; editor/history appear after expanding. */
        #page-dashboard .sk-note-collapsible.is-collapsed .nrow,
        #page-dashboard .sk-note-collapsible.is-collapsed .sk-notes-tools,
        #page-dashboard .sk-note-collapsible.is-collapsed #notesList,
        #page-dashboard .sk-note-collapsible.is-collapsed #notesFilterInfo{display:none!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function toggleCard(card, header, open) {
    card.classList.toggle('is-expanded', open);
    card.classList.toggle('is-collapsed', !open);
    header.setAttribute('aria-expanded', open ? 'true' : 'false');
    var chev=header.querySelector('.sk-summary-chevron'); if(chev) chev.textContent=open?'⌃':'⌄';
  }

  function setupTaskSummary(card) {
    if (!card || card.__skTaskAccordion) return;
    var oldHeader=card.querySelector('.card-hd'); if(!oldHeader) return;
    card.__skTaskAccordion=true;
    card.classList.add('sk-task-collapsible','is-collapsed');
    var header=document.createElement('div'); header.className='sk-task-summary'; header.setAttribute('role','button'); header.setAttribute('tabindex','0'); header.setAttribute('aria-expanded','false');
    header.innerHTML='<div class="sk-summary-main"><div class="sk-summary-icon sk-task-summary-icon">✓</div><div><div class="sk-summary-title">Úkoly</div><div class="sk-summary-value"><strong id="skTaskDone">0</strong> / <span id="skTaskTotal">0</span> splněno</div><div class="sk-summary-progress"><span id="skTaskProgress"></span></div><div class="sk-summary-meta" id="skTaskMeta">Zatím žádné úkoly</div></div></div><div class="sk-summary-chevron">⌄</div>';
    oldHeader.replaceWith(header);
    var toggle=function(){toggleCard(card,header,!card.classList.contains('is-expanded'));};
    header.addEventListener('click',toggle);
    header.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
    refreshSummary();
  }

  function setupNotesSummary(card) {
    if (!card || card.__skNoteAccordion) return;
    var oldHeader=card.querySelector('.card-hd'); if(!oldHeader) return;
    card.__skNoteAccordion=true;
    card.classList.add('sk-note-collapsible','is-collapsed');
    var header=document.createElement('div'); header.className='sk-note-summary'; header.setAttribute('role','button'); header.setAttribute('tabindex','0'); header.setAttribute('aria-expanded','false');
    var count=(Array.isArray(window.notes)?window.notes.length:0);
    var preview='';
    if(count && window.notes[0] && window.notes[0].text) preview=String(window.notes[0].text);
    header.innerHTML='<div class="sk-summary-main"><div class="sk-summary-icon sk-note-summary-icon">✎</div><div><div class="sk-summary-title">Poznámky</div><div class="sk-summary-value">'+count+' uložených</div><div class="sk-summary-meta">'+(preview?preview:'Žádné uložené poznámky')+'</div></div></div><div class="sk-summary-chevron">⌄</div>';
    oldHeader.replaceWith(header);
    var toggle=function(){toggleCard(card,header,!card.classList.contains('is-expanded'));};
    header.addEventListener('click',toggle);
    header.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
  }

  function bindAccordions() {
    injectStyles();
    var taskList=document.getElementById('taskList');
    var taskCard=taskList && taskList.closest('.card');
    if(taskCard) setupTaskSummary(taskCard);
    var noteList=document.getElementById('notesList');
    var noteCard=noteList && noteList.closest('.card');
    if(noteCard) setupNotesSummary(noteCard);
  }

  function init() {
    bindCheckboxes(); bindTaskEntry(); bindCapture(); bindAccordions(); refreshSummary();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  setTimeout(init,250); setTimeout(init,1000); setTimeout(init,2000); setTimeout(init,3500);
})();