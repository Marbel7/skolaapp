/* SkolaApp mobile shell — aligned bottom navigation */
(function(){
  'use strict';
  if(window.__SKOLA_MOBILE_SHELL__) return;
  window.__SKOLA_MOBILE_SHELL__=true;
  const mobile=()=>window.matchMedia('(max-width:700px)').matches;

  const css=document.createElement('style');
  css.textContent=`
  @media(max-width:700px){
    body{padding-bottom:calc(104px + env(safe-area-inset-bottom))!important;overflow-x:hidden!important}

    /* Dashboard order: Tasks -> Notes -> Quick links */
    #page-dashboard>div[style*="grid-template-columns:1fr 300px"]{display:block!important}
    #page-dashboard>div[style*="grid-template-columns:1fr 300px"]>div:first-child{display:flex!important;flex-direction:column!important}
    #page-dashboard>div[style*="grid-template-columns:1fr 300px"]>div:first-child>.grid2{display:contents!important}
    #page-dashboard .grid2>.card:nth-child(2){order:1!important}
    #page-dashboard .grid2>.card:first-child{order:3!important}
    #page-dashboard>div[style*="grid-template-columns:1fr 300px"]>div:first-child>.card:last-child{order:2!important}
    #page-dashboard>div[style*="grid-template-columns:1fr 300px"]>div:last-child{display:none!important}

    /* Bottom navigation — one balanced surface, five equal columns */
    .sk-mobile-bar{
      position:fixed!important;left:10px!important;right:10px!important;
      bottom:calc(10px + env(safe-area-inset-bottom))!important;
      height:70px!important;padding:0 6px!important;
      background:rgba(255,255,255,.97)!important;
      backdrop-filter:blur(22px)!important;-webkit-backdrop-filter:blur(22px)!important;
      border:1px solid #E8E8F0!important;border-radius:24px!important;
      box-shadow:0 12px 38px rgba(32,32,51,.14)!important;
      z-index:9990!important;display:grid!important;
      grid-template-columns:repeat(5,minmax(0,1fr))!important;
      align-items:stretch!important;overflow:visible!important;
    }
    .sk-mobile-btn{
      position:relative!important;width:100%!important;height:70px!important;
      margin:0!important;padding:0!important;border:0!important;background:transparent!important;
      color:#7C8198!important;font:600 10px Inter,-apple-system,BlinkMacSystemFont,sans-serif!important;
      display:flex!important;flex-direction:column!important;align-items:center!important;
      justify-content:center!important;gap:5px!important;min-width:0!important;
      cursor:pointer!important;-webkit-tap-highlight-color:transparent!important;
    }
    .sk-mobile-btn svg{width:22px!important;height:22px!important;stroke:currentColor!important;flex:0 0 auto!important}
    .sk-mobile-btn.active{color:#6C5CE7!important}
    .sk-mobile-btn.active:after{content:'';width:4px;height:4px;border-radius:50%;background:#6C5CE7;position:absolute;left:50%;bottom:6px;transform:translateX(-50%)}

    .sk-mobile-fab-wrap{
      width:100%!important;height:70px!important;display:flex!important;
      align-items:flex-start!important;justify-content:center!important;position:relative!important;
    }
    .sk-mobile-fab{
      margin-top:-18px!important;width:62px!important;height:62px!important;
      border:0!important;border-radius:21px!important;background:#6C5CE7!important;color:#fff!important;
      box-shadow:0 10px 24px rgba(108,92,231,.32)!important;
      display:flex!important;align-items:center!important;justify-content:center!important;
      position:relative!important;cursor:pointer!important;padding:0!important;
    }
    .sk-mobile-fab svg{width:28px!important;height:28px!important;stroke:currentColor!important}
    .sk-mobile-fab-label{position:absolute!important;top:65px!important;left:50%!important;transform:translateX(-50%)!important;color:#6C5CE7!important;font:700 10px Inter,sans-serif!important;white-space:nowrap!important}

    /* Compact dashboard cards */
    #page-dashboard .grid2>.card:nth-child(2){padding:14px!important;border-radius:18px!important;background:#fff!important;box-shadow:0 3px 14px rgba(32,32,51,.06)!important}
    #page-dashboard .grid2>.card:nth-child(2) .card-hd{margin-bottom:9px!important;align-items:center!important}
    #page-dashboard .grid2>.card:nth-child(2) .card-ttl{font-size:11px!important;font-weight:800!important;text-transform:uppercase!important;letter-spacing:.06em!important;color:#7C8198!important}
    #page-dashboard .grid2>.card:nth-child(2) .card-sub{font-size:20px!important;line-height:1.1!important;font-weight:800!important;color:#202033!important;margin-top:2px!important}
    #page-dashboard .grid2>.card:nth-child(2) .toolbar-row{display:none!important}
    #page-dashboard .grid2>.card:nth-child(2) .ti-row{display:grid!important;grid-template-columns:minmax(0,1fr) 54px 48px!important;gap:7px!important;margin-bottom:8px!important}
    #page-dashboard .grid2>.card:nth-child(2) .tadd{height:40px!important;padding:0!important}
    #page-dashboard .grid2>.card:nth-child(2) .tlist{max-height:none!important;gap:5px!important}
    #page-dashboard .grid2>.card:nth-child(2) .titem{min-height:44px!important;padding:8px 9px!important;border-radius:12px!important}

    #page-dashboard .grid2>.card:first-child{padding:14px!important;border-radius:18px!important;box-shadow:0 2px 10px rgba(32,32,51,.05)!important}
    #page-dashboard .grid2>.card:first-child .card-ttl{font-size:13px!important;font-weight:800!important;text-transform:none!important;letter-spacing:0!important;color:#202033!important}
    #page-dashboard .grid2>.card:first-child .card-sub{font-size:11px!important}
    #page-dashboard .lgrid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important}
    #page-dashboard .lbtn{min-height:58px!important;padding:9px!important;border-radius:12px!important;background:#fff!important}
    #page-dashboard .li{width:32px!important;height:32px!important;flex:0 0 32px!important}
    #page-dashboard .ln{font-size:12px!important}.ld{font-size:9px!important}
    #page-dashboard .la{opacity:1!important}

    #page-dashboard>div[style*="grid-template-columns:1fr 300px"]>div:first-child>.card:last-child{margin-top:9px!important;padding:14px!important;border-radius:18px!important;box-shadow:0 2px 10px rgba(32,32,51,.05)!important}
    #page-dashboard>div[style*="grid-template-columns:1fr 300px"]>div:first-child>.card:last-child .ninput{min-height:70px!important}

    /* Capture sheet */
    .sk-capture{position:fixed;inset:0;background:rgba(20,20,35,.46);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:10000;display:none;align-items:flex-end;justify-content:center}
    .sk-capture.open{display:flex}.sk-sheet{width:100%;max-width:560px;background:#fff;border-radius:28px 28px 0 0;padding:10px 18px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -18px 60px rgba(0,0,0,.2);box-sizing:border-box;max-height:88vh;overflow:auto}
    .sk-grab{width:38px;height:4px;background:#DADAE5;border-radius:9px;margin:0 auto 15px}.sk-title{font:700 20px Inter,-apple-system,sans-serif;color:#202033}.sk-sub{font:13px Inter,-apple-system,sans-serif;color:#7C8198;margin:4px 0 15px}
    .sk-mode{display:grid;grid-template-columns:1fr 1fr;gap:7px;background:#F4F4F8;padding:4px;border-radius:13px;margin-bottom:11px}.sk-mode button{height:38px;border:0;border-radius:10px;background:transparent;color:#7C8198;font:700 12px Inter,sans-serif}.sk-mode button.active{background:#fff;color:#6C5CE7;box-shadow:0 1px 5px rgba(32,32,51,.08)}
    .sk-voice{display:flex;align-items:center;gap:11px;padding:11px 12px;border:1px solid #E8E8F0;border-radius:14px;margin-bottom:10px;background:#FCFCFE;cursor:pointer}.sk-voice.recording{border-color:#E7DFFF;background:#F7F5FF}.sk-voice-icon{width:38px;height:38px;border-radius:12px;background:#F0EEFF;color:#6C5CE7;display:flex;align-items:center;justify-content:center;flex:0 0 auto}.sk-voice.recording .sk-voice-icon{background:#6C5CE7;color:#fff}.sk-voice-copy strong{display:block;font:700 12px Inter,sans-serif;color:#202033}.sk-voice-copy span{display:block;font:11px Inter,sans-serif;color:#7C8198;margin-top:2px}.sk-record-time{margin-left:auto;font:700 11px ui-monospace,SFMono-Regular,monospace;color:#6C5CE7;display:none}.sk-voice.recording .sk-record-time{display:block}
    .sk-live{display:none;align-items:center;gap:7px;margin:-2px 0 8px;color:#6C5CE7;font:700 11px Inter,sans-serif}.sk-live.on{display:flex}.sk-live-dot{width:7px;height:7px;border-radius:50%;background:#6C5CE7;animation:skLive 1s infinite}@keyframes skLive{50%{opacity:.35}}
    .sk-text{width:100%;min-height:96px;max-height:190px;border:1px solid #E8E8F0;border-radius:15px;padding:13px;box-sizing:border-box;font:500 16px/1.45 Inter,-apple-system,BlinkMacSystemFont,sans-serif;resize:none;outline:none;color:#202033;background:#fff}.sk-actions{display:grid;grid-template-columns:1fr 1.6fr;gap:8px;margin-top:10px}.sk-actions button{height:48px;border-radius:13px;border:1px solid #E8E8F0;font:700 14px Inter,sans-serif}.sk-save{background:#6C5CE7;color:#fff;border-color:#6C5CE7!important}.sk-save:disabled{opacity:.42}.sk-message{display:none;margin-top:9px;padding:9px 11px;border-radius:11px;background:#FFF7E9;color:#9A671A;font:500 10px/1.35 Inter,sans-serif}.sk-message.on{display:block}.sk-hint{font:10px Inter,sans-serif;color:#A8ABBE;text-align:center;margin-top:9px}
  }
  @media(min-width:701px){.sk-mobile-bar,.sk-capture{display:none!important}}
  `;
  document.head.appendChild(css);

  const icon=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const icons={
    home:icon('<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>'),
    material:icon('<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
    evidence:icon('<path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h6M9 15h4"/>'),
    settings:icon('<circle cx="12" cy="12" r="3"/><path d="M19 15.2a2 2 0 0 0 .4 2.2l.1.1-2.1 2.1-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8v.1h-3v-.1a2 2 0 0 0-1.2-1.8 2 2 0 0 0-2.2.4l-.1.1-2.1-2.1.1-.1a2 2 0 0 0 .4-2.2 2 2 0 0 0-1.8-1.2H4v-3h.1a2 2 0 0 0 1.8-1.2 2 2 0 0 0-.4-2.2l-.1-.1 2.1-2.1.1.1a2 2 0 0 0 2.2.4A2 2 0 0 0 11 4.1V4h3v.1a2 2 0 0 0 1.2 1.8 2 2 0 0 0 2.2-.4l.1-.1 2.1 2.1-.1.1a2 2 0 0 0-.4 2.2A2 2 0 0 0 20.9 11h.1v3h-.1a2 2 0 0 0-1.9 1.2z"/>'),
    mic:icon('<rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>')
  };

  const bar=document.createElement('nav');
  bar.className='sk-mobile-bar';
  bar.innerHTML=`<button class="sk-mobile-btn active" data-page="dashboard">${icons.home}<span>Přehled</span></button><button class="sk-mobile-btn" data-page="materials">${icons.material}<span>Materiály</span></button><div class="sk-mobile-fab-wrap"><button class="sk-mobile-fab" id="sk-open-capture" aria-label="Rychlé zachycení">${icons.mic}<span class="sk-mobile-fab-label">Zachytit</span></button></div><button class="sk-mobile-btn" data-page="evidence">${icons.evidence}<span>Evidence</span></button><button class="sk-mobile-btn" data-page="settings">${icons.settings}<span>Nastavení</span></button>`;
  document.body.appendChild(bar);

  const overlay=document.createElement('div');
  overlay.className='sk-capture';
  overlay.innerHTML=`<div class="sk-sheet" role="dialog" aria-modal="true"><div class="sk-grab"></div><div class="sk-title">Rychlé zachycení</div><div class="sk-sub">Řekni nebo napiš, co si nechceš nechat utéct.</div><div class="sk-mode"><button class="active" id="sk-task">Úkol</button><button id="sk-thought">Myšlenka</button></div><div class="sk-voice" id="sk-voice"><div class="sk-voice-icon">${icons.mic}</div><div class="sk-voice-copy"><strong id="sk-voice-title">Namluvit</strong><span id="sk-voice-copy">Klepni a řekni to vlastními slovy</span></div><span class="sk-record-time" id="sk-record-time">0:00</span></div><div class="sk-live" id="sk-live"><span class="sk-live-dot"></span><span>Poslouchám… přepis se tvoří průběžně</span></div><textarea class="sk-text" id="sk-text" placeholder="Např. zkontrolovat rozvrh 6.B…"></textarea><div class="sk-actions"><button id="sk-cancel">Zrušit</button><button class="sk-save" id="sk-save" disabled>Uložit</button></div><div class="sk-message" id="sk-message"></div><div class="sk-hint">Hlas se po zastavení převede na upravitelný text. Nic se neuloží bez potvrzení.</div></div>`;
  document.body.appendChild(overlay);

  const text=overlay.querySelector('#sk-text'),voice=overlay.querySelector('#sk-voice'),live=overlay.querySelector('#sk-live'),message=overlay.querySelector('#sk-message'),save=overlay.querySelector('#sk-save'),voiceTitle=overlay.querySelector('#sk-voice-title'),voiceCopy=overlay.querySelector('#sk-voice-copy'),timer=overlay.querySelector('#sk-record-time');
  let mode='task',recognition=null,recording=false,finalTranscript='',startedAt=0,timerId=null;
  const refresh=()=>save.disabled=!text.value.trim();
  const setMode=m=>{mode=m;overlay.querySelector('#sk-task').classList.toggle('active',m==='task');overlay.querySelector('#sk-thought').classList.toggle('active',m==='thought');text.placeholder=m==='task'?'Např. zkontrolovat rozvrh 6.B…':'Např. nápad na poradu, co nesmím zapomenout…';};
  overlay.querySelector('#sk-task').onclick=()=>setMode('task');overlay.querySelector('#sk-thought').onclick=()=>setMode('thought');text.oninput=refresh;
  const fmt=ms=>{const s=Math.floor(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
  const recUI=on=>{recording=on;voice.classList.toggle('recording',on);live.classList.toggle('on',on);voiceTitle.textContent=on?'Poslouchám…':'Namluvit';voiceCopy.textContent=on?'Klepni znovu a zastav nahrávání':'Klepni a řekni to vlastními slovy';if(on){startedAt=Date.now();timer.textContent='0:00';timerId=setInterval(()=>timer.textContent=fmt(Date.now()-startedAt),250)}else{clearInterval(timerId);timerId=null}};
  const stop=()=>{if(recognition){try{recognition.stop()}catch(e){}recognition=null}recUI(false)};
  const start=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){message.textContent='Tento prohlížeč nepodporuje živý hlasový přepis.';message.classList.add('on');return}message.classList.remove('on');recognition=new SR();recognition.lang='cs-CZ';recognition.continuous=true;recognition.interimResults=true;finalTranscript=text.value.trim();if(finalTranscript)finalTranscript+=' ';recognition.onstart=()=>recUI(true);recognition.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal)finalTranscript+=r[0].transcript+' ';else interim+=r[0].transcript}text.value=(finalTranscript+interim).trim();refresh()};recognition.onerror=e=>{recUI(false);if(e.error!=='aborted'){message.textContent=e.error==='not-allowed'?'Mikrofon nebyl povolen. Povol mikrofon pro tento web.':'Hlasový vstup skončil s chybou.';message.classList.add('on')}};recognition.onend=()=>{if(recording)recUI(false);refresh()};try{recognition.start()}catch(e){recUI(false)}};
  voice.onclick=()=>recording?(stop()):start();
  const close=()=>{stop();overlay.classList.remove('open');setTimeout(()=>{text.value='';finalTranscript='';message.classList.remove('on');refresh()},150)};
  overlay.querySelector('#sk-cancel').onclick=close;overlay.onclick=e=>{if(e.target===overlay)close()};bar.querySelector('#sk-open-capture').onclick=()=>{overlay.classList.add('open');setMode(mode);setTimeout(()=>text.focus(),80)};
  save.onclick=()=>{const v=text.value.trim();if(!v)return;if(mode==='task'){const i=document.getElementById('taskInput'),b=document.getElementById('taskAddBtn');if(i&&b){i.value=v;b.click()}}else{const i=document.getElementById('noteDraft'),b=document.getElementById('saveNoteBtn');if(i&&b){i.value=v;b.click()}}close()};
  bar.querySelectorAll('[data-page]').forEach(btn=>btn.onclick=()=>{bar.querySelectorAll('.sk-mobile-btn').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const t=document.querySelector('.ntab[data-page="'+btn.dataset.page+'"]');if(t)t.click()});

  const sync=()=>{const card=document.querySelector('#page-dashboard .grid2>.card:nth-child(2)');if(!card)return;const items=card.querySelectorAll('.titem'),total=items.length,done=card.querySelectorAll('.titem.done').length,pct=total?Math.round(done/total*100):0;card.setAttribute('data-progress',pct+' %');};
  const init=()=>{sync();const list=document.getElementById('taskList');if(list)new MutationObserver(sync).observe(list,{childList:true,subtree:true,attributes:true});};
  setTimeout(init,300);setTimeout(sync,1200);
  document.documentElement.classList.toggle('sk-mobile-active',mobile());window.addEventListener('resize',()=>document.documentElement.classList.toggle('sk-mobile-active',mobile()));
})();
