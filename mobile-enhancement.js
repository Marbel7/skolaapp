/* Compatibility loader: keep the existing mobile shell and load the task interaction fix. */
(function(){
  'use strict';
  if (window.__SKOLA_MOBILE_LOADER__) return;
  window.__SKOLA_MOBILE_LOADER__ = true;

  function load(src, done) {
    var s = document.createElement('script');
    s.src = src + '?v=20260815-taskfix';
    s.async = false;
    s.onload = function(){ if (done) done(); };
    s.onerror = function(){ console.error('[SKOLA] Failed to load ' + src); if (done) done(); };
    (document.head || document.documentElement).appendChild(s);
  }

  load('mobile-shell-original.js', function(){
    load('task-interaction-fix.js');
  });
})();