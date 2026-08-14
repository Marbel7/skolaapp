/* SkolaApp mobile shell — direct main app enhancement */
(function(){
  'use strict';
  if (window.__SKOLA_MOBILE_SHELL__) return;
  window.__SKOLA_MOBILE_SHELL__ = true;

  const isMobile = () => window.matchMedia('(max-width: 700px)').matches;
  const css = document.createElement('style');
  css.textContent = `
    @media (max-width:700px){
      body{padding-bottom:calc(96px + env(safe-area-inset-bottom))!important;overflow-x:hidden!important}
      .sk-mobile-bar{position:fixed;left:10px;right:10px;bottom:calc(8px + env(safe-area-inset-bottom));height:70px;background:rgba(255,255,255,.94);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border:1px solid #E8E8F0;border-radius:23px;box-shadow:0 12px 38px rgba(32,32,51,.14);z-index:9990;display:grid;grid-template-columns:1fr 1fr 1.15fr 1fr 1fr;align-items:end;padding:0 5px 6px}
      .sk-mobile-btn{position:relative;height:52px;border:0;background:transparent;color:#7C8198;font:600 10px Inter,-apple-system,BlinkMacSystemFont,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;min-width:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .sk-mobile-btn svg{width:21px;height:21px;stroke:currentColor}.sk-mobile-btn.active{color:#6C5CE7}.sk-mobile-btn.active:after{content:'';width:4px;height:4px;border-radius:50%;background:#6C5CE7;position:absolute;bottom:-2px}
      .sk-mobile-fab-wrap{height:76px;display:flex;justify-content:center;align-items:flex-start}.sk-mobile-fab{margin-top:-19px!important;width:62px!important;height:62px!important;border:0!important;border-radius:21px!important;background:#6C5CE7!important;color:#fff!important;box-shadow:0 10px 24px rgba(108,92,231,.32)!important;display:flex!important;align-items:center!important;justify-content:center!important;position:relative!important;cursor:pointer}.sk-mobile-fab svg{width:27px!important;height:27px!important}.sk-mobile-fab-label{position:absolute;top:65px;color:#6C5CE7;font:700 10px Inter,sans-serif;white-space:nowrap}
      .sk-capture{position:fixed;inset:0;background:rgba(20,20,35,.46);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:10000;display:none;align-items:flex-end;justify-content:center}
      .sk-capture.open{display:flex}.sk-sheet{width:100%;max-width:560px;background:#fff;border-radius:28px 28px 0 0;padding:10px 18px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -18px 60px rgba(0,0,0,.2);box-sizing:border-box;max-height:88vh;overflow:auto}
      .sk-grab{width:38px;height:4px;background:#DADAE5;border-radius:9px;margin:0 auto 15px}.sk-title{font:700 20px Inter,-apple-system,sans-serif;color:#202033}.sk-sub{font:13px Inter,-apple-system,sans-serif;color:#7C8198;margin:4px 0 15px}
      .sk-mode{display:grid;grid-template-columns:1fr 1fr;gap:7px;background:#F4F4F8;padding:4px;border-radius:13px;margin-bottom:11px}.sk-mode button{height:38px;border:0;border-radius:10px;background:transparent;color:#7C8198;font:700 12px Inter,sans-serif}.sk-mode button.active{background:#fff;color:#6C5CE7;box-shadow:0 1px 5px rgba(32,32,51,.08)}
      .sk-voice{display:flex;align-items:center;gap:11px;padding:11px 12px;border:1px solid #E8E8F0;border-radius:14px;margin-bottom:10px;background:#FCFCFE;cursor:pointer}.sk-voice.recording{border-color:#E7DFFF;background:#F7F5FF}.sk-voice-icon{width:38px;height:38px;border-radius:12px;background:#F0EEFF;color:#6C5CE7;display:flex;align-items:center;justify-content:center;flex:0 0 auto}.sk-voice.recording .sk-voice-icon{background:#6C5CE7;color:#fff;animation:skMicPulse 1.35s infinite}.sk-voice-copy strong{display:block;font:700 12px Inter,sans-serif;color:#202033}.sk-voice-copy span{display:block;font:11px Inter,sans-serif;color:#7C8198;margin-top:2px}.sk-record-time{margin-left:auto;font:700 11px ui-monospace,SFMono-Regular,monospace;color:#6C5CE7;display:none}.sk-voice.recording .sk-record-time{display:block}@keyframes skMicPulse{0%,100%{box-shadow:0 0 0 0 rgba(108,92,231,.18)}50%{box-shadow:0 0 0 8px rgba(108,92,231,.06)}}
      .sk-live{display:none;align-items:center;gap:7px;margin:-2px 0 8px;color:#6C5CE7;font:700 11px Inter,sans-serif}.sk-live.on{display:flex}.sk-live-dot{width:7px;height:7px;border-radius:50%;background:#6C5CE7;animation:skLive 1s infinite}@keyframes skLive{50%{opacity:.35}}
      .sk-text{width:100%;min-height:96px;max-height:190px;border:1px solid #E8E8F0;border-radius:15px;padding:13px;box-sizing:border-box;font:500 16px/1.45 Inter,-apple-system,BlinkMacSystemFont,sans-serif;resize:none;outline:none;color:#202033;background:#fff}.sk-text:focus{border-color:#6C5CE7;box-shadow:0 0 0 3px #F0EEFF}
      .sk-actions{display:grid;grid-template-columns:1fr 1.6fr;gap:8px;margin-top:10px}.sk-actions button{height:48px;border-radius:13px;border:1px solid #E8E8F0;font:700 14px Inter,sans-serif}.sk-save{background:#6C5CE7;color:#fff;border-color:#6C5CE7!important}.sk-save:disabled{opacity:.42}.sk-message{display:none;margin-top:9px;padding:9px 11px;border-radius:11px;background:#FFF7E9;color:#9A671A;font:500 10px/1.35 Inter,sans-serif}.sk-message.on{display:block}.sk-hint{font:10px Inter,sans-serif;color:#A8ABBE;text-align:center;margin-top:9px}
    }
    @media(min-width:701px){.sk-mobile-bar,.sk-capture{display:none!important}}
  `;
  document.head.appendChild(css);

  const icon = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  const icons = {
    home: icon('<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>'),
    material: icon('<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
    evidence: icon('<path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h6M9 15h4"/>'),
    settings: icon('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.6v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6v-2.6h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1z"/>'),
    mic: icon('<rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>')
  };

  const bar = document.createElement('nav');
  bar.className = 'sk-mobile-bar';
  bar.innerHTML = `<button class="sk-mobile-btn active" data-page="dashboard">${icons.home}<span>Přehled</span></button><button class="sk-mobile-btn" data-page="materials">${icons.material}<span>Materiály</span></button><div class="sk-mobile-fab-wrap"><button class="sk-mobile-fab" id="sk-open-capture" aria-label="Rychlé zachycení">${icons.mic}<span class="sk-mobile-fab-label">Zachytit</span></button></div><button class="sk-mobile-btn" data-page="evidence">${icons.evidence}<span>Evidence</span></button><button class="sk-mobile-btn" data-page="settings">${icons.settings}<span>Nastavení</span></button>`;
  document.body.appendChild(bar);

  const overlay = document.createElement('div');
  overlay.className = 'sk-capture';
  overlay.innerHTML = `<div class="sk-sheet" role="dialog" aria-modal="true" aria-label="Rychlé zachycení"><div class="sk-grab"></div><div class="sk-title">Rychlé zachycení</div><div class="sk-sub">Řekni nebo napiš, co si nechceš nechat utéct.</div><div class="sk-mode"><button class="active" id="sk-task">Úkol</button><button id="sk-thought">Myšlenka</button></div><div class="sk-voice" id="sk-voice" role="button" tabindex="0"><div class="sk-voice-icon">${icons.mic}</div><div class="sk-voice-copy"><strong id="sk-voice-title">Namluvit</strong><span id="sk-voice-copy">Klepni a řekni to vlastními slovy</span></div><span class="sk-record-time" id="sk-record-time">0:00</span></div><div class="sk-live" id="sk-live"><span class="sk-live-dot"></span><span>Poslouchám… přepis se tvoří průběžně</span></div><textarea class="sk-text" id="sk-text" placeholder="Např. zkontrolovat rozvrh 6.B…"></textarea><div class="sk-actions"><button id="sk-cancel">Zrušit</button><button class="sk-save" id="sk-save" disabled>Uložit</button></div><div class="sk-message" id="sk-message"></div><div class="sk-hint">Hlas se po zastavení převede na upravitelný text. Nic se neuloží bez tvého potvrzení.</div></div>`;
  document.body.appendChild(overlay);

  const text = overlay.querySelector('#sk-text');
  const voice = overlay.querySelector('#sk-voice');
  const live = overlay.querySelector('#sk-live');
  const message = overlay.querySelector('#sk-message');
  const save = overlay.querySelector('#sk-save');
  const voiceTitle = overlay.querySelector('#sk-voice-title');
  const voiceCopy = overlay.querySelector('#sk-voice-copy');
  const timer = overlay.querySelector('#sk-record-time');
  let mode = 'task', recognition = null, recording = false, finalTranscript = '', startedAt = 0, timerId = null;

  const refreshSave = () => { save.disabled = !text.value.trim(); };
  const setMode = (next) => { mode = next; overlay.querySelector('#sk-task').classList.toggle('active', mode === 'task'); overlay.querySelector('#sk-thought').classList.toggle('active', mode === 'thought'); text.placeholder = mode === 'task' ? 'Např. zkontrolovat rozvrh 6.B…' : 'Např. nápad na poradu, co nesmím zapomenout…'; if (!recording) setTimeout(() => text.focus(), 30); };
  overlay.querySelector('#sk-task').onclick = () => setMode('task');
  overlay.querySelector('#sk-thought').onclick = () => setMode('thought');
  text.addEventListener('input', refreshSave);

  function formatTime(ms){ const sec=Math.floor(ms/1000); return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'); }
  function setRecordingUI(on){ recording=on; voice.classList.toggle('recording',on); live.classList.toggle('on',on); voiceTitle.textContent=on?'Poslouchám…':'Namluvit'; voiceCopy.textContent=on?'Klepni znovu a zastav nahrávání':'Klepni a řekni to vlastními slovy'; if(on){ startedAt=Date.now(); timer.textContent='0:00'; timerId=setInterval(()=>timer.textContent=formatTime(Date.now()-startedAt),250); } else { clearInterval(timerId); timerId=null; } }
  function stopRecognition(){ if(recognition){ try{recognition.stop();}catch(e){} } }
  function startRecognition(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ message.textContent='Tento prohlížeč nepodporuje živý hlasový přepis. Použij klávesnici nebo Safari/Chrome s podporou hlasového vstupu.'; message.classList.add('on'); return; }
    message.classList.remove('on'); recognition=new SR(); recognition.lang='cs-CZ'; recognition.continuous=true; recognition.interimResults=true; finalTranscript=text.value.trim(); if(finalTranscript) finalTranscript+=' ';
    recognition.onstart=()=>setRecordingUI(true);
    recognition.onresult=(event)=>{ let interim=''; for(let i=event.resultIndex;i<event.results.length;i++){ const r=event.results[i]; if(r.isFinal) finalTranscript+=r[0].transcript+' '; else interim+=r[0].transcript; } text.value=(finalTranscript+interim).trim(); refreshSave(); };
    recognition.onerror=(event)=>{ setRecordingUI(false); if(event.error==='not-allowed'||event.error==='service-not-allowed') message.textContent='Mikrofon nebyl povolen. Povol mikrofon pro tento web a zkus to znovu.'; else if(event.error!=='aborted') message.textContent='Hlasový vstup skončil s chybou. Text můžeš dál zadat ručně.'; if(event.error!=='aborted') message.classList.add('on'); };
    recognition.onend=()=>{ if(recording) setRecordingUI(false); refreshSave(); };
    try{ recognition.start(); }catch(e){ setRecordingUI(false); message.textContent='Hlasový vstup se nepodařilo spustit. Zkus to prosím ještě jednou.'; message.classList.add('on'); }
  }
  voice.onclick=()=> recording ? (stopRecognition(),setRecordingUI(false)) : startRecognition();
  voice.onkeydown=(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); voice.click(); } };

  function closeCapture(){ stopRecognition(); setRecordingUI(false); overlay.classList.remove('open'); setTimeout(()=>{ text.value=''; finalTranscript=''; message.classList.remove('on'); refreshSave(); },180); }
  overlay.querySelector('#sk-cancel').onclick=closeCapture;
  overlay.addEventListener('click',(e)=>{ if(e.target===overlay) closeCapture(); });
  bar.querySelector('#sk-open-capture').onclick=()=>{ overlay.classList.add('open'); setMode(mode); };
  save.onclick=()=>{
    const value=text.value.trim(); if(!value){ text.focus(); return; }
    stopRecognition(); setRecordingUI(false);
    if(mode==='task'){
      const input=document.getElementById('taskInput'), button=document.getElementById('taskAddBtn');
      if(input&&button){ input.value=value; button.click(); }
    }else{
      const input=document.getElementById('noteDraft'), button=document.getElementById('saveNoteBtn');
      if(input&&button){ input.value=value; button.click(); }
    }
    closeCapture();
  };
  bar.querySelectorAll('[data-page]').forEach(btn=>btn.onclick=()=>{
    bar.querySelectorAll('.sk-mobile-btn').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
    const target=document.querySelector('.ntab[data-page="'+btn.dataset.page+'"]'); if(target) target.click();
  });

  const updateMobileVisibility=()=>{ document.documentElement.classList.toggle('sk-mobile-active',isMobile()); };
  updateMobileVisibility(); window.addEventListener('resize',updateMobileVisibility);
})();
