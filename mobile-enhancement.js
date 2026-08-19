/* SkolaApp mobile compatibility + targeted iOS Safari auth repair. */
(function(){
  'use strict';
  if (window.__SKOLA_MOBILE_LOADER__) return;
  window.__SKOLA_MOBILE_LOADER__ = true;

  /*
   * AUTH ONLY:
   * iOS Safari is the environment where the popup auth path has previously
   * failed by briefly leaving the page and returning to the login overlay.
   * Keep the desktop/other-browser auth in index.html untouched.
   * On iOS use Firebase redirect auth, with LOCAL -> SESSION persistence
   * fallback for Safari Private Browsing.
   * index.html already processes getRedirectResult(), so no second auth
   * state machine is introduced here.
   */
  try {
    var ua = navigator.userAgent || '';
    var isIOS = /iPhone|iPad|iPod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS && window.firebase && firebase.auth && typeof window.fbSignIn === 'function') {
      var mobileAuth = firebase.auth();

      window.fbSignIn = function(){
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        mobileAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
          .catch(function(err){
            console.warn('[AUTH] iOS LOCAL persistence unavailable:', err.code || err.message);
            return mobileAuth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
          })
          .then(function(){
            return mobileAuth.signInWithRedirect(provider);
          })
          .catch(function(err){
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
      console.log('[SKOLA] targeted iOS Safari auth repair active');
    }
  } catch (e) {
    console.error('[SKOLA] iOS auth repair init failed:', e);
  }

  function load(src, done) {
    var s = document.createElement('script');
    s.src = src + '?v=20260819-ios-auth-repair';
    s.async = false;
    s.onload = function(){ if (done) done(); };
    s.onerror = function(){ console.error('[SKOLA] Failed to load ' + src); if (done) done(); };
    (document.head || document.documentElement).appendChild(s);
  }

  // Mobile UI only. Authentication repair above is the only auth change.
  // Notes accordion is UI-only: it does not own or modify notes data.
  load('mobile-shell-original.js', function(){
    load('notes-accordion.js');
  });
})();
