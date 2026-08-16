/* SkolaApp mobile compatibility loader. */
(function(){
  'use strict';
  if (window.__SKOLA_MOBILE_LOADER__) return;
  window.__SKOLA_MOBILE_LOADER__ = true;

  function load(src, done) {
    var s = document.createElement('script');
    s.src = src + '?v=20260816-mobile-clean';
    s.async = false;
    s.onload = function(){ if (done) done(); };
    s.onerror = function(){ console.error('[SKOLA] Failed to load ' + src); if (done) done(); };
    (document.head || document.documentElement).appendChild(s);
  }

  // Mobile UI only. Authentication remains exclusively in index.html.
  load('mobile-shell-original.js');
})();
