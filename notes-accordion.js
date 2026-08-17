/* SkolaApp notes accordion — UI only, no data ownership. */
(function(){
  'use strict';
  if (window.__SKOLA_NOTES_ACCORDION__) return;
  window.__SKOLA_NOTES_ACCORDION__ = true;

  function install(){
    if (!window.matchMedia('(max-width:700px)').matches) return;
    var list = document.getElementById('notesList');
    if (!list) return;
    var card = list.closest('.card');
    if (!card || card.dataset.notesAcc === '1') return;
    var head = card.querySelector('.card-hd');
    if (!head) return;

    var style = document.createElement('style');
    style.textContent = '.sk-notes-card{overflow:hidden}.sk-notes-acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0;margin:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none}.sk-notes-copy{display:flex;flex:1;min-width:0;flex-direction:column}.sk-notes-title{font-size:13px;font-weight:800;color:#202033}.sk-notes-count{font-size:12px;font-weight:600;color:#7C8198;margin-top:3px}.sk-notes-chev{width:32px;height:32px;flex-shrink:0;display:grid;place-items:center;border:1px solid #E8E8F0;border-radius:50%;background:#F4F4F8;color:#7C8198;font-size:16px;line-height:1;pointer-events:none}.sk-notes-content{padding-top:0}.sk-notes-card.sk-notes-collapsed .sk-notes-content{display:none!important}.sk-notes-card.sk-notes-expanded .sk-notes-content{display:block!important}';
    document.head.appendChild(style);

    card.dataset.notesAcc = '1';
    card.classList.add('sk-notes-card');
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'sk-notes-acc-btn';
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="sk-notes-copy"><span class="sk-notes-title">Poznámky</span><span class="sk-notes-count" id="skNotesCount">0 poznámek</span></span><span class="sk-notes-chev" aria-hidden="true">⌄</span>';
    head.replaceWith(button);

    var content = document.createElement('div');
    content.className = 'sk-notes-content';
    while (card.children.length > 1) content.appendChild(card.children[1]);
    card.appendChild(content);

    var expanded = false;
    function syncCount(){
      var el = document.getElementById('notesCount');
      var out = document.getElementById('skNotesCount');
      if (!out) return;
      var n = el ? parseInt(String(el.textContent || '0'), 10) : 0;
      if (!isFinite(n)) n = 0;
      out.textContent = n + (n === 1 ? ' poznámka' : ' poznámek');
    }
    function apply(){
      card.classList.toggle('sk-notes-expanded', expanded);
      card.classList.toggle('sk-notes-collapsed', !expanded);
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      var chev = button.querySelector('.sk-notes-chev');
      if (chev) chev.textContent = expanded ? '⌃' : '⌄';
      syncCount();
    }
    button.addEventListener('click', function(e){ expanded = !expanded; apply(); e.preventDefault(); e.stopPropagation(); });

    var countEl = document.getElementById('notesCount');
    if (countEl && window.MutationObserver) new MutationObserver(syncCount).observe(countEl, {childList:true, characterData:true, subtree:true});
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
})();
