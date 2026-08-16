/* SkolaApp — stable dashboard task/note accordions */
(function(){
  'use strict';
  if(window.__SKOLA_DASHBOARD_ACCORDIONS__){
    window.__SKOLA_DASHBOARD_ACCORDIONS__.reapply();
    return;
  }

  function text(id){
    var e=document.getElementById(id);
    return e ? String(e.textContent||'').trim() : '';
  }

  function taskSource(){
    if(Array.isArray(window.tasks) && window.tasks.length) return window.tasks;
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem('zs_tasks_v3') || '[]'); } catch(e) { raw = []; }
    return Array.isArray(raw) ? raw : [];
  }

  function refreshTaskSummary(){
    var doneEl=document.getElementById('skTaskDone');
    var totalEl=document.getElementById('skTaskTotal');
    var prog=document.getElementById('skTaskProgress');
    var meta=document.getElementById('skTaskMeta');
    var source=taskSource();
    if(source.length){
      var done=source.filter(function(t){return !!t.done;}).length;
      var total=source.length;
      if(doneEl && doneEl.textContent!==String(done)) doneEl.textContent=done;
      if(totalEl && totalEl.textContent!==String(total)) totalEl.textContent=total;
      if(prog) prog.style.width=(total?Math.round(done/total*100):0)+'%';
      if(meta) meta.textContent=(total-done)+' zbývá';
      return;
    }
    var m=text('doneCount').match(/(\d+)\s*\/\s*(\d+)/);
    if(!m) return;
    var d=Number(m[1]),t=Number(m[2]);
    if(doneEl && doneEl.textContent!==String(d)) doneEl.textContent=d;
    if(totalEl && totalEl.textContent!==String(t)) totalEl.textContent=t;
    if(prog) prog.style.width=(t?Math.round(d/t*100):0)+'%';
    if(meta) meta.textContent=t ? ((t-d)+' zbývá') : 'Zatím žádné úkoly';
  }

  function reconcileTaskList(){
    var list=document.getElementById('taskList');
    if(!list) return;
    var source=taskSource();
    if(source.length && typeof window.renderTasks==='function'){
      var empty=list.querySelector('.tempty');
      if(empty || !list.querySelector('.titem')){
        window.renderTasks();
      }
    }
    refreshTaskSummary();
  }

  function refreshNotesSummary(){
    var count=document.getElementById('skNotesCount');
    var preview=document.getElementById('skNotesPreview');
    if(Array.isArray(window.notes)){
      var c=window.notes.length+' uložených';
      var latest=window.notes[0]&&window.notes[0].text ? String(window.notes[0].text).trim() : '';
      if(count && count.textContent!==c) count.textContent=c;
      if(preview){
        var p=latest||'Žádné uložené poznámky';
        if(preview.textContent!==p) preview.textContent=p;
      }
      return;
    }
    var m=text('notesCount').match(/\d+/);
    if(m && count){
      var fallback=Number(m[0])+' uložených';
      if(count.textContent!==fallback) count.textContent=fallback;
    }
  }

  function syncTaskCheckmarks(root){
    var scope=root||document;
    if(!scope.querySelectorAll) return;
    scope.querySelectorAll('.tck').forEach(function(b){
      var wanted=b.classList.contains('checked')?'✓':'';
      var pressed=b.classList.contains('checked')?'true':'false';
      if(b.textContent!==wanted) b.textContent=wanted;
      if(b.getAttribute('aria-pressed')!==pressed) b.setAttribute('aria-pressed',pressed);
    });
  }

  function expanded(card,button,on){
    card.classList.toggle('is-expanded',on);
    card.classList.toggle('is-collapsed',!on);
    button.setAttribute('aria-expanded',on?'true':'false');
    var chevron=button.querySelector('.sk-summary-chevron');
    if(chevron) chevron.textContent=on?'⌃':'⌄';
  }

  function installAccordionClick(){
    if(document.__skAccordionClickInstalled) return;
    document.__skAccordionClickInstalled=true;
    document.addEventListener('click',function(e){
      var target=e.target&&e.target.closest ? e.target.closest('.sk-task-summary,.sk-note-summary') : null;
      if(!target) return;
      var card=target.closest('.card');
      if(!card) return;
      e.preventDefault();
      e.stopPropagation();
      expanded(card,target,!card.classList.contains('is-expanded'));
    },true);
  }

  function makeTaskAccordion(){
    var list=document.getElementById('taskList');
    var card=list&&list.closest('.card');
    if(!card || card.dataset.skTaskAccordion==='1') return;
    var head=card.querySelector('.card-hd');
    if(!head) return;
    card.dataset.skTaskAccordion='1';
    card.classList.add('sk-task-collapsible');
    var b=document.createElement('button');
    b.type='button';
    b.className='sk-task-summary';
    b.setAttribute('aria-expanded','false');
    b.innerHTML='<span class="sk-summary-copy"><span class="sk-summary-title">Úkoly</span><span class="sk-summary-value"><strong id="skTaskDone">0</strong> / <span id="skTaskTotal">0</span> splněno</span><span class="sk-summary-progress"><span id="skTaskProgress"></span></span><span class="sk-summary-meta" id="skTaskMeta">Zatím žádné úkoly</span></span><span class="sk-summary-chevron" aria-hidden="true">⌄</span>';
    head.replaceWith(b);
    expanded(card,b,false);
    refreshTaskSummary();
  }

  function makeNotesAccordion(){
    var list=document.getElementById('notesList');
    var card=list&&list.closest('.card');
    if(!card || card.dataset.skNotesAccordion==='1') return;
    var head=card.querySelector('.card-hd');
    if(!head) return;
    var search=document.getElementById('notesSearch');
    if(search&&search.parentElement) search.parentElement.classList.add('sk-notes-tools');
    card.dataset.skNotesAccordion='1';
    card.classList.add('sk-note-collapsible');
    var b=document.createElement('button');
    b.type='button';
    b.className='sk-note-summary';
    b.setAttribute('aria-expanded','false');
    b.innerHTML='<span class="sk-summary-copy"><span class="sk-note-heading"><span class="sk-note-icon" aria-hidden="true">✎</span><span class="sk-summary-title">Poznámky</span></span><span class="sk-summary-value" id="skNotesCount">0 uložených</span><span class="sk-summary-meta" id="skNotesPreview">Žádné uložené poznámky</span></span><span class="sk-summary-chevron" aria-hidden="true">⌄</span>';
    head.replaceWith(b);
    expanded(card,b,false);
    refreshNotesSummary();
  }

  function installStyles(){
    if(document.getElementById('sk-dashboard-accordion-styles')) return;
    var s=document.createElement('style');
    s.id='sk-dashboard-accordion-styles';
    s.textContent=''+
      '#page-dashboard .sk-task-summary,#page-dashboard .sk-note-summary{position:relative;z-index:20;width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 1.1rem;padding:0;border:0;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer;pointer-events:auto;touch-action:manipulation;-webkit-tap-highlight-color:transparent}'+
      '#page-dashboard .sk-summary-copy{display:flex;flex:1;min-width:0;flex-direction:column}'+
      '#page-dashboard .sk-note-heading{display:inline-flex;align-items:center;gap:6px}'+
      '#page-dashboard .sk-note-icon{color:var(--amber);font-size:15px;line-height:1}'+
      '#page-dashboard .sk-summary-title{font-size:13px;font-weight:600;color:var(--ink)}'+
      '#page-dashboard .sk-summary-value{margin-top:2px;font-size:12px;font-weight:600;color:var(--ink2)}'+
      '#page-dashboard .sk-summary-progress{width:min(180px,100%);height:5px;margin-top:7px;overflow:hidden;border-radius:999px;background:var(--surface3)}'+
      '#page-dashboard .sk-summary-progress>span{display:block;height:100%;border-radius:inherit;background:var(--primary);transition:width .15s ease}'+
      '#page-dashboard .sk-summary-meta{margin-top:5px;overflow:hidden;color:var(--ink3);font-size:11px;font-weight:500;text-overflow:ellipsis;white-space:nowrap}'+
      '#page-dashboard .sk-summary-chevron{display:grid;width:32px;height:32px;flex:0 0 32px;place-items:center;border:1px solid var(--border);border-radius:50%;background:var(--surface2);color:var(--ink2);font-size:17px;line-height:1;pointer-events:none}'+
      '#page-dashboard .sk-task-collapsible.is-collapsed .toolbar-row,#page-dashboard .sk-task-collapsible.is-collapsed .ti-row,#page-dashboard .sk-task-collapsible.is-collapsed #taskList{display:none!important}'+
      '#page-dashboard .sk-note-collapsible.is-collapsed .nrow,#page-dashboard .sk-note-collapsible.is-collapsed .sk-notes-tools,#page-dashboard .sk-note-collapsible.is-collapsed #notesFilterInfo,#page-dashboard .sk-note-collapsible.is-collapsed #notesList{display:none!important}'+
      '#page-dashboard .sk-task-collapsible.is-expanded .toolbar-row{display:flex!important}'+
      '#page-dashboard .tck{position:relative!important;overflow:hidden;-webkit-appearance:none!important;appearance:none!important}'+
      '#page-dashboard .tck.checked{background:var(--primary)!important;border-color:var(--primary)!important;color:#fff!important;font-size:12px!important;font-weight:800!important;line-height:1!important;text-align:center!important}'+
      '#page-dashboard .tck.checked::after{content:none!important}'+
      '#page-dashboard .n-del{min-width:36px!important;min-height:36px!important;padding:7px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;touch-action:manipulation!important;pointer-events:auto!important}'+
      '@media(max-width:700px){'+
      '#page-dashboard .sk-task-summary,#page-dashboard .sk-note-summary{min-height:68px;margin-bottom:0}'+
      '#page-dashboard .sk-summary-title{font-size:14px;font-weight:700}'+
      '#page-dashboard .sk-summary-value{font-size:13px}'+
      '#page-dashboard .sk-task-collapsible.is-expanded #taskList{max-height:min(42vh,360px)!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;padding-right:2px}'+
      '#page-dashboard .sk-task-collapsible.is-expanded .tdel{opacity:1!important;visibility:visible!important;pointer-events:auto!important;position:relative!important;z-index:3!important;min-width:30px!important;min-height:30px!important}'+
      '#page-dashboard .sk-task-collapsible.is-expanded .tck{position:relative!important;z-index:3!important;pointer-events:auto!important;min-width:30px!important;min-height:30px!important}'+
      '#page-dashboard .sk-task-collapsible.is-expanded .titem{position:relative;z-index:1}'+
      '#page-dashboard .sk-task-collapsible.is-expanded #taskList button{touch-action:manipulation;-webkit-tap-highlight-color:transparent}'+
      '#page-dashboard .sk-note-collapsible.is-expanded #notesList{max-height:min(42vh,360px)!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important}'+
      '}';
    document.head.appendChild(s);
  }

  function installObservers(){
    var list=document.getElementById('taskList');
    if(list && !list.__skTaskObserver){
      list.__skTaskObserver=new MutationObserver(function(){
        syncTaskCheckmarks(list);
        refreshTaskSummary();
      });
      list.__skTaskObserver.observe(list,{childList:true,subtree:true});
      syncTaskCheckmarks(list);
    }
    var notesList=document.getElementById('notesList');
    if(notesList && !notesList.__skNotesObserver){
      notesList.__skNotesObserver=new MutationObserver(refreshNotesSummary);
      notesList.__skNotesObserver.observe(notesList,{childList:true,subtree:true});
    }
  }

  function installNoteDelete(){
    var list=document.getElementById('notesList');
    if(!list || list.__skNoteDelete) return;
    list.__skNoteDelete=true;
    list.addEventListener('click',function(e){
      var btn=e.target&&e.target.closest ? e.target.closest('[data-note-del]') : null;
      if(!btn || !list.contains(btn)) return;
      var idx=parseInt(btn.getAttribute('data-note-del'),10);
      if(!Number.isInteger(idx) || !Array.isArray(window.notes) || !window.notes[idx]) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      var note=window.notes[idx];
      if(window.fbSyncEnabled && note.id && typeof window.fbDeleteNote==='function'){
        window.fbDeleteNote(note.id);
      }else{
        window.notes.splice(idx,1);
        if(typeof window.saveJSON==='function') window.saveJSON('zs_notes_list_v1',window.notes);
        if(typeof window.renderNotes==='function') window.renderNotes();
      }
    },true);
  }

  function init(){
    installStyles();
    makeTaskAccordion();
    makeNotesAccordion();
    installAccordionClick();
    installObservers();
    installNoteDelete();
    refreshTaskSummary();
    refreshNotesSummary();
    syncTaskCheckmarks(document);
    reconcileTaskList();
    var tries=0;
    var timer=setInterval(function(){
      reconcileTaskList();
      if(++tries>=20) clearInterval(timer);
    },500);
  }

  window.__SKOLA_DASHBOARD_ACCORDIONS__={reapply:init};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();