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

    card.dataset.notesAcc = '1';
    card.classList.add('sk-notes-card');

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'sk-notes-acc-btn';
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML =
      '<span class="sk-notes-copy">' +
        '<span class="sk-notes-title">Poznámky</span>' +
        '<span class="sk-notes-count" id="skNotesCount">0 poznámek</span>' +
      '</span>' +
      '<span class="sk-notes-chev" aria-hidden="true">⌄</span>';

    head.replaceWith(button);

    var content = document.createElement('div');
    content.className = 'sk-notes-content';
    while (card.children.length > 1) content.appendChild(card.children[1]);
    card.appendChild(content);

    var expanded = false;
    function apply(){
      card.classList.toggle('sk-notes-expanded', expanded);
      card.classList.toggle('sk-notes-collapsed', !expanded);
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      var chev = button.querySelector('.sk-notes-chev');
      if (chev) chev.textContent = expanded ? '⌃' : '⌄';
      syncCount();
    }

    function syncCount(){
      var el = document.getElementById('notesCount');
      var out = document.getElementById('skNotesCount');
      if (!out) return;
      var n = el ? parseInt(String(el.textContent || '0'), 10) : 0;
      if (!isFinite(n)) n = 0;
      out.textContent = n + (n === 1 ? ' poznámka' : ' poznámek');
    }

    button.addEventListener('click', function(e){
      expanded = !expanded;
      apply();
      e.preventDefault();
      e.stopPropagation();
    });

    var countEl = document.getElementById('notesCount');
    if (countEl && window.MutationObserver) {
      new MutationObserver(syncCount).observe(countEl, {childList:true, characterData:true, subtree:true});
    }

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, {once:true});
  } else {
    install();
  }
})();
