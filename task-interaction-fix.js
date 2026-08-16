/* SkolaApp — dashboard task/note accordion fix */
(function(){
  'use strict';
  if(window.__SKOLA_DASHBOARD_ACCORDIONS__){ window.__SKOLA_DASHBOARD_ACCORDIONS__.reapply(); return; }

  function text(id){ var e=document.getElementById(id); return e ? String(e.textContent||'').trim() : ''; }
  function refreshTaskSummary(){
    var doneEl=document.getElementById('skTaskDone'), totalEl=document.getElementById('skTaskTotal'), prog=document.getElementById('skTaskProgress'), meta=document.getElementById('skTaskMeta');
    var raw=Array.isArray(window.tasks) ? window.tasks : null;
    if(raw){
      var done=raw.filter(function(t){return !!t.done;}).length, total=raw.length;
      if(doneEl) doneEl.textContent=done; if(totalEl) totalEl.textContent=total;
      if(prog) prog.style.width=(total?Math.round(done/total*100):0)+'%';
      if(meta) meta.textContent=total ? (total-done ? (total-done)+' zbývá' : 'Všechno hotovo') : 'Zatím žádné úkoly';
      return;
    }
    var m=text('doneCount').match(/(\d+)\s*\/\s*(\d+)/); if(!m) return;
    var d=Number(m[1]), t=Number(m[2]);
    if(doneEl) doneEl.textContent=d; if(totalEl) totalEl.textContent=t;
    if(prog) prog.style.width=(t?Math.round(d/t*100):0)+'%';
    if(meta) meta.textContent=t ? (t-d ? (t-d)+' zbývá' : 'Všechno hotovo') : 'Zatím žádné úkoly';
  }
  function refreshNotesSummary(){
    var count=document.getElementById('skNotesCount'), preview=document.getElementById('skNotesPreview');
    if(Array.isArray(window.notes)){
      if(count) count.textContent=window.notes.length+' uložených';
      var latest=window.notes[0]&&window.notes[0].text ? String(window.notes[0].text).trim() : '';
      if(preview) preview.textContent=latest||'Žádné uložené poznámky';
      return;
    }
    var m=text('notesCount').match(/\d+/); if(m&&count) count.textContent=Number(m[0])+' uložených';
  }

  /* iOS/Safari: keep a real text checkmark inside the button instead of relying only on ::after. */
  function syncTaskCheckmarks(root){
    var scope=root||document;
    var buttons=scope.querySelectorAll ? scope.querySelectorAll('.tck') : [];
    for(var i=0;i<buttons.length;i++){
      var b=buttons[i];
      b.textContent=b.classList.contains('checked')?'✓':'';
      b.setAttribute('aria-pressed',b.classList.contains('checked')?'true':'false');
    }
  }
  function installTaskCheckmarkObserver(){
    var list=document.getElementById('taskList');
    if(!list||list.__skCheckmarkObserver)return;
    list.__skCheckmarkObserver=new MutationObserver(function(){syncTaskCheckmarks(list);});
    list.__skCheckmarkObserver.observe(list,{childList:true,subtree:true});
    syncTaskCheckmarks(list);
  }

  /* Robust note delete handler for iOS. It runs in capture phase and replaces the older bubble handler. */
  function installNoteDeleteHandler(){
    var list=document.getElementById('notesList');
    if(!list||list.__skRobustDeleteHandler)return;
    list.__skRobustDeleteHandler=true;
    list.addEventListener('click',function(e){
      var btn=e.target&&e.target.closest ? e.target.closest('[data-note-del]') : null;
      if(!btn||!list.contains(btn))return;
      var idx=parseInt(btn.getAttribute('data-note-del'),10);
      if(!Number.isInteger(idx)||!Array.isArray(window.notes)||!window.notes[idx])return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      var note=window.notes[idx];
      if(window.fbSyncEnabled&&note.id&&typeof window.fbDeleteNote==='function'){
        window.fbDeleteNote(note.id);
      }else{
        window.notes.splice(idx,1);
        if(typeof window.saveJSON==='function')window.saveJSON('zs_notes_list_v1',window.notes);
        if(typeof window.renderNotes==='function')window.renderNotes();
      }
    },true);
  }

  function expanded(card,button,on){
    card.classList.toggle('is-expanded',on); card.classList.toggle('is-collapsed',!on);
    button.setAttribute('aria-expanded',on?'true':'false');
    var c=button.querySelector('.sk-summary-chevron'); if(c)c.textContent=on?'⌃':'⌄';
  }
  function toggleBind(card,button){
    if(button.dataset.skToggleBound==='1') return; button.dataset.skToggleBound='1';
    function go(){expanded(card,button,!card.classList.contains('is-expanded'));}
    button.addEventListener('click',go);
    button.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});
  }
  function taskAccordion(){
    var list=document.getElementById('taskList'), card=list&&list.closest('.card'); if(!card||card.dataset.skTaskAccordion==='1')return;
    var head=card.querySelector('.card-hd'); if(!head)return; card.dataset.skTaskAccordion='1'; card.classList.add('sk-task-collapsible');
    var b=document.createElement('button'); b.type='button'; b.className='sk-task-summary'; b.setAttribute('aria-expanded','false');
    b.innerHTML='<span class="sk-summary-copy"><span class="sk-summary-title">Úkoly</span><span class="sk-summary-value"><strong id="skTaskDone">0</strong> / <span id="skTaskTotal">0</span> splněno</span><span class="sk-summary-progress"><span id="skTaskProgress"></span></span><span class="sk-summary-meta" id="skTaskMeta">Zatím žádné úkoly</span></span><span class="sk-summary-chevron" aria-hidden="true">⌄</span>';
    head.replaceWith(b); expanded(card,b,false); toggleBind(card,b); refreshTaskSummary();
  }
  function notesAccordion(){
    var list=document.getElementById('notesList'), card=list&&list.closest('.card'); if(!card||card.dataset.skNotesAccordion==='1')return;
    var head=card.querySelector('.card-hd'); if(!head)return; var search=document.getElementById('notesSearch');
    if(search&&search.parentElement)search.parentElement.classList.add('sk-notes-tools');
    card.dataset.skNotesAccordion='1'; card.classList.add('sk-note-collapsible');
    var b=document.createElement('button'); b.type='button'; b.className='sk-note-summary'; b.setAttribute('aria-expanded','false');
    b.innerHTML='<span class="sk-summary-copy"><span class="sk-note-heading"><span class="sk-note-icon" aria-hidden="true">✎</span><span class="sk-summary-title">Poznámky</span></span><span class="sk-summary-value" id="skNotesCount">0 uložených</span><span class="sk-summary-meta" id="skNotesPreview">Žádné uložené poznámky</span></span><span class="sk-summary-chevron" aria-hidden="true">⌄</span>';
    head.replaceWith(b); expanded(card,b,false); toggleBind(card,b); refreshNotesSummary();
  }
  function styles(){
    if(document.getElementById('sk-dashboard-accordion-styles'))return;
    var s=document.createElement('style'); s.id='sk-dashboard-accordion-styles';
    s.textContent=''+
      '#page-dashboard .sk-task-summary,#page-dashboard .sk-note-summary{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 1.1rem;padding:0;border:0;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer}'+
      '#page-dashboard .sk-summary-copy{display:flex;flex:1;min-width:0;flex-direction:column}'+
      '#page-dashboard .sk-note-heading{display:inline-flex;align-items:center;gap:6px}'+
      '#page-dashboard .sk-note-icon{color:var(--amber);font-size:15px;line-height:1}'+
      '#page-dashboard .sk-summary-title{font-size:13px;font-weight:600;color:var(--ink)}'+
      '#page-dashboard .sk-summary-value{margin-top:2px;font-size:12px;font-weight:600;color:var(--ink2)}'+
      '#page-dashboard .sk-summary-progress{width:min(180px,100%);height:5px;margin-top:7px;overflow:hidden;border-radius:999px;background:var(--surface3)}'+
      '#page-dashboard .sk-summary-progress>span{display:block;height:100%;border-radius:inherit;background:var(--primary);transition:width .15s ease}'+
      '#page-dashboard .sk-summary-meta{margin-top:5px;overflow:hidden;color:var(--ink3);font-size:11px;font-weight:500;text-overflow:ellipsis;white-space:nowrap}'+
      '#page-dashboard .sk-summary-chevron{display:grid;width:32px;height:32px;flex:0 0 32px;place-items:center;border:1px solid var(--border);border-radius:50%;background:var(--surface2);color:var(--ink2);font-size:17px;line-height:1}'+
      '#page-dashboard .sk-task-collapsible.is-collapsed .toolbar-row,#page-dashboard .sk-task-collapsible.is-collapsed .ti-row,#page-dashboard .sk-task-collapsible.is-collapsed #taskList,#page-dashboard .sk-note-collapsible.is-collapsed .nrow,#page-dashboard .sk-note-collapsible.is-collapsed .sk-notes-tools,#page-dashboard .sk-note-collapsible.is-collapsed #notesFilterInfo,#page-dashboard .sk-note-collapsible.is-collapsed #notesList{display:none!important}'+
      '#page-dashboard .sk-task-collapsible.is-expanded .toolbar-row{display:flex!important}'+
      '#page-dashboard .tck{position:relative!important;overflow:hidden;-webkit-appearance:none!important;appearance:none!important}'+
      '#page-dashboard .tck.checked{background:var(--primary)!important;border-color:var(--primary)!important;color:#fff!important}'+
      '#page-dashboard .tck.checked::after{content:none!important}'+
      '#page-dashboard .tck.checked{font-size:12px!important;font-weight:800!important;line-height:1!important;text-align:center!important}'+
      '#page-dashboard .n-del{min-width:36px!important;min-height:36px!important;padding:7px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;touch-action:manipulation!important;pointer-events:auto!important}'+
      '@media(max-width:700px){#page-dashboard .sk-task-summary,#page-dashboard .sk-note-summary{min-height:68px;margin-bottom:0}#page-dashboard .sk-summary-title{font-size:14px;font-weight:700}#page-dashboard .sk-summary-value{font-size:13px}#page-dashboard .sk-task-collapsible.is-expanded #taskList{max-height:min(42vh,360px)!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;padding-right:2px}#page-dashboard .sk-task-collapsible.is-expanded .tdel{opacity:1!important;visibility:visible!important;pointer-events:auto!important;position:relative!important;z-index:3!important;min-width:30px!important;min-height:30px!important}#page-dashboard .sk-task-collapsible.is-expanded .tck{position:relative!important;z-index:3!important;pointer-events:auto!important;min-width:30px!important;min-height:30px!important}#page-dashboard .sk-task-collapsible.is-expanded .titem{position:relative;z-index:1}#page-dashboard .sk-task-collapsible.is-expanded #taskList button{touch-action:manipulation;-webkit-tap-highlight-color:transparent}#page-dashboard .sk-note-collapsible.is-expanded #notesList{max-height:min(42vh,360px)!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important}}';
    document.head.appendChild(s);
  }
  function wrap(name,fn){
    var original=window[name]; if(typeof original!=='function'||original.__skAccordionWrapped)return;
    function wrapped(){var r=original.apply(this,arguments);fn();if(name==='renderTasks')syncTaskCheckmarks(document);return r;} wrapped.__skAccordionWrapped=true; window[name]=wrapped;
  }
  function observe(){
    var tc=document.getElementById('doneCount'), nc=document.getElementById('notesCount');
    if(tc&&!tc.__skSummaryObserver){tc.__skSummaryObserver=new MutationObserver(refreshTaskSummary);tc.__skSummaryObserver.observe(tc,{childList:true,characterData:true,subtree:true});}
    if(nc&&!nc.__skSummaryObserver){nc.__skSummaryObserver=new MutationObserver(refreshNotesSummary);nc.__skSummaryObserver.observe(nc,{childList:true,characterData:true,subtree:true});}
  }
  function init(){styles();taskAccordion();notesAccordion();wrap('renderTasks',refreshTaskSummary);wrap('renderNotes',refreshNotesSummary);observe();installTaskCheckmarkObserver();installNoteDeleteHandler();refreshTaskSummary();refreshNotesSummary();syncTaskCheckmarks(document);setTimeout(function(){refreshTaskSummary();refreshNotesSummary();syncTaskCheckmarks(document);},500);}
  window.__SKOLA_DASHBOARD_ACCORDIONS__={reapply:init};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
