/* SkolaApp mobile compatibility loader. */
(function(){
  'use strict';
  if (window.__SKOLA_MOBILE_LOADER__) return;
  window.__SKOLA_MOBILE_LOADER__ = true;

  function load(src, done) {
    var s = document.createElement('script');
    s.src = src + '?v=20260817-notes-accordion';
    s.async = false;
    s.onload = function(){ if (done) done(); };
    s.onerror = function(){ console.error('[SKOLA] Failed to load ' + src); if (done) done(); };
    (document.head || document.documentElement).appendChild(s);
  }

  // Mobile UI only. Authentication remains exclusively in index.html.
  // Notes accordion is UI-only: it does not own or modify notes data.
  load('mobile-shell-original.js', function(){
    load('notes-accordion.js');
  });
})();
