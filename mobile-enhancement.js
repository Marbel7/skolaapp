/* SkolaApp mobile compatibility + Safari Firebase auth repair. */
(function(){
  'use strict';
  if (window.__SKOLA_MOBILE_LOADER__) return;
  window.__SKOLA_MOBILE_LOADER__ = true;

  /*
   * iOS Safari is the one environment where the stable popup-only auth path
   * is unreliable. Keep popup auth everywhere else, but use redirect auth on
   * iOS and fall back from LOCAL to SESSION persistence for Private Browsing.
   * This runs after index.html so it can safely replace the global onclick
   * function without changing the rest of the Firebase data layer.
   */
  try {
    var ua = navigator.userAgent || '';
    var isIOS = /iPhone|iPad|iPod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS && window.firebase && firebase.auth) {
      var mobileAuth = firebase.auth();
      var originalSignIn = window.fbSignIn;
      window.fbSignIn = function(){
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        var persistence = mobileAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
          .catch(function(err){
            console.warn('[AUTH] iOS LOCAL persistence unavailable:', err.code || err.message);
            return mobileAuth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
          });
        persistence.then(function(){
          return mobileAuth.signInWithRedirect(provider);
        }).catch(function(err){
          console.error('[AUTH] iOS redirect sign-in error:', err.code, err.message);
          var msg = null;
          switch (err.code) {
            case 'auth/unauthorized-domain':
              msg = 'Doména není povolena ve Firebase Console.';
              break;
            case 'auth/network-request-failed':
              msg = 'Chyba sítě. Zkontrolujte připojení.';
              break;
            case 'auth/operation-not-supported-in-this-environment':
            case 'auth/unsupported-persistence-type':
              msg = 'Safari blokuje potřebné úložiště pro přihlášení. Zkuste běžné okno Safari.';
              break;
            default:
              msg = 'Chyba přihlášení: ' + (err.message || err.code);
          }
          if (msg) {
            if (typeof window.showToast === 'function') window.showToast('⚠️ ' + msg);
            else window.alert(msg);
          }
        });
      };
      window.__SKOLA_IOS_AUTH_REPAIR__ = true;
      console.log('[SKOLA] iOS Safari auth repair active');
    }
  } catch (e) {
    console.error('[SKOLA] iOS auth repair init failed:', e);
  }

  function load(src, done) {
    var s = document.createElement('script');
    s.src = src + '?v=20260816-ios-auth';
    s.async = false;
    s.onload = function(){ if (done) done(); };
    s.onerror = function(){ console.error('[SKOLA] Failed to load ' + src); if (done) done(); };
    (document.head || document.documentElement).appendChild(s);
  }

  load('mobile-shell-original.js', function(){
    load('task-interaction-fix.js');
  });
})();
