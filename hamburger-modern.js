/* SkolaApp — coherent mobile navigation layer
   Owns the visual system for the hamburger drawer + bottom navigation.
   Existing page/navigation logic remains the source of truth. */
(function () {
  'use strict';
  if (window.__SKOLA_MOBILE_NAV_V2__) return;
  window.__SKOLA_MOBILE_NAV_V2__ = true;

  const MOBILE = '(max-width: 700px)';
  const primary = '#6C5CE7';
  const primarySoft = '#F0EEFF';
  const ink = '#202033';
  const muted = '#737991';
  const border = '#E8E8F0';

  const css = document.createElement('style');
  css.id = 'sk-mobile-navigation-v2';
  css.textContent = `
    @media ${MOBILE} {
      :root {
        --mobile-primary: ${primary};
        --mobile-primary-soft: ${primarySoft};
        --mobile-ink: ${ink};
        --mobile-muted: ${muted};
        --mobile-border: ${border};
      }

      /* ─────────────────────────────────────────────
         HAMBURGER DRAWER
      ───────────────────────────────────────────── */
      .mob-drawer-overlay {
        background: rgba(20,20,35,.46) !important;
        backdrop-filter: blur(5px) !important;
        -webkit-backdrop-filter: blur(5px) !important;
        z-index: 9998 !important;
      }

      .mob-drawer {
        width: min(84vw, 340px) !important;
        max-width: 340px !important;
        background: #fff !important;
        border: 0 !important;
        border-right: 1px solid var(--mobile-border) !important;
        border-radius: 0 26px 26px 0 !important;
        box-shadow: 12px 0 42px rgba(20,20,35,.16) !important;
        z-index: 9999 !important;
        overflow: hidden !important;
        isolation: isolate !important;
        will-change: transform;
      }

      .mob-drawer-hd {
        min-height: 88px !important;
        padding: max(16px, env(safe-area-inset-top)) 18px 14px !important;
        padding-top: max(16px, calc(env(safe-area-inset-top) + 10px)) !important;
        gap: 12px !important;
        border-bottom: 1px solid var(--mobile-border) !important;
        background: #fff !important;
      }

      .mob-drawer-hd img {
        width: 44px !important;
        height: 44px !important;
        border-radius: 13px !important;
        border: 0 !important;
        box-shadow: 0 5px 14px rgba(108,92,231,.14) !important;
        flex: 0 0 44px !important;
      }

      .mob-drawer-hd > span {
        font-size: 16px !important;
        font-weight: 750 !important;
        letter-spacing: -.02em !important;
        color: var(--mobile-ink) !important;
        white-space: nowrap !important;
      }

      .mob-drawer-close {
        width: 42px !important;
        height: 42px !important;
        margin-left: auto !important;
        padding: 0 !important;
        border: 1px solid var(--mobile-border) !important;
        border-radius: 14px !important;
        background: #F7F7FA !important;
        color: var(--mobile-muted) !important;
        font-size: 18px !important;
        line-height: 1 !important;
        display: grid !important;
        place-items: center !important;
        flex: 0 0 42px !important;
        transition: transform .14s ease, background .14s ease !important;
      }
      .mob-drawer-close:active { transform: scale(.95) !important; background: #F0F0F5 !important; }

      .mob-drawer-nav {
        padding: 18px 12px !important;
        overflow-y: auto !important;
        overscroll-behavior: contain !important;
        -webkit-overflow-scrolling: touch !important;
      }

      .mob-drawer-item {
        min-height: 60px !important;
        margin: 4px 0 !important;
        padding: 8px 12px !important;
        border-radius: 17px !important;
        gap: 13px !important;
        font-size: 15px !important;
        font-weight: 650 !important;
        color: var(--mobile-muted) !important;
        width: 100% !important;
        box-sizing: border-box !important;
        transition: background .16s ease, color .16s ease, transform .12s ease !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      .mob-drawer-item:hover {
        background: #F7F7FA !important;
        color: var(--mobile-ink) !important;
      }
      .mob-drawer-item:active { transform: scale(.985) !important; }

      .mob-drawer-item .drawer-icon {
        width: 44px !important;
        height: 44px !important;
        flex: 0 0 44px !important;
        border-radius: 14px !important;
        display: grid !important;
        place-items: center !important;
        background: #F5F5F9 !important;
        color: #747A91 !important;
        transition: background .16s ease, color .16s ease, box-shadow .16s ease !important;
      }
      .mob-drawer-item .drawer-icon svg { width: 21px !important; height: 21px !important; display: block !important; }

      .mob-drawer-item.active {
        background: var(--mobile-primary-soft) !important;
        color: var(--mobile-primary) !important;
        font-weight: 750 !important;
        box-shadow: inset 0 0 0 1px rgba(108,92,231,.045) !important;
      }
      .mob-drawer-item.active .drawer-icon {
        background: #fff !important;
        color: var(--mobile-primary) !important;
        box-shadow: 0 4px 12px rgba(108,92,231,.12) !important;
      }

      .mob-drawer-foot {
        min-height: 12px !important;
        padding: 12px 14px calc(12px + env(safe-area-inset-bottom)) !important;
        border-top: 1px solid var(--mobile-border) !important;
        background: #fff !important;
      }
      #fbSignOutBtnMob {
        min-height: 44px !important;
        border-radius: 13px !important;
        font-weight: 650 !important;
        color: var(--mobile-muted) !important;
        background: #F7F7FA !important;
        border-color: var(--mobile-border) !important;
      }

      /* ─────────────────────────────────────────────
         BOTTOM NAVIGATION
      ───────────────────────────────────────────── */
      body {
        padding-bottom: calc(116px + env(safe-area-inset-bottom)) !important;
      }

      .sk-mobile-bar {
        left: 12px !important;
        right: 12px !important;
        bottom: calc(10px + env(safe-area-inset-bottom)) !important;
        height: 72px !important;
        padding: 0 6px 7px !important;
        border: 1px solid rgba(232,232,240,.95) !important;
        border-radius: 25px !important;
        background: rgba(255,255,255,.96) !important;
        backdrop-filter: blur(24px) saturate(1.15) !important;
        -webkit-backdrop-filter: blur(24px) saturate(1.15) !important;
        box-shadow: 0 14px 40px rgba(32,32,51,.14) !important;
        z-index: 9990 !important;
      }

      .sk-mobile-btn {
        height: 54px !important;
        gap: 4px !important;
        color: #7C8198 !important;
        font-size: 10px !important;
        font-weight: 650 !important;
        letter-spacing: -.01em !important;
        border-radius: 16px !important;
        transition: color .16s ease, background .16s ease !important;
      }
      .sk-mobile-btn svg { width: 22px !important; height: 22px !important; }
      .sk-mobile-btn.active { color: var(--mobile-primary) !important; }
      .sk-mobile-btn.active:after {
        width: 4px !important;
        height: 4px !important;
        bottom: -2px !important;
        background: var(--mobile-primary) !important;
      }
      .sk-mobile-btn:active { background: #F7F7FA !important; }

      .sk-mobile-fab-wrap { height: 78px !important; }
      .sk-mobile-fab {
        width: 66px !important;
        height: 66px !important;
        margin-top: -23px !important;
        border-radius: 22px !important;
        background: var(--mobile-primary) !important;
        box-shadow: 0 12px 28px rgba(108,92,231,.30), 0 0 0 7px rgba(255,255,255,.94) !important;
      }
      .sk-mobile-fab svg { width: 29px !important; height: 29px !important; }
      .sk-mobile-fab:active { transform: scale(.96) !important; }
      .sk-mobile-fab-label {
        top: 68px !important;
        font-size: 10px !important;
        font-weight: 750 !important;
        color: var(--mobile-primary) !important;
      }

      /* Drawer owns the interaction while open. */
      body.drawer-open .sk-mobile-bar { pointer-events: none !important; }

      /* Respect reduced motion. */
      @media (prefers-reduced-motion: reduce) {
        .mob-drawer, .mob-drawer-item, .mob-drawer-close,
        .sk-mobile-btn, .sk-mobile-fab { transition: none !important; animation: none !important; }
      }
    }
  `;
  document.head.appendChild(css);

  const icon = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icons = {
    dashboard: icon('<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-5h5v5"/>'),
    materials: icon('<path d="M5 4.5h14v15H5z"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>'),
    evidence: icon('<path d="M7 3.5h10v17H7z"/><path d="M9.5 7.5h5M9.5 11.5h5M9.5 15.5h3.5"/>'),
    dohledy: icon('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/><path d="M4.5 12h2M17.5 12h2"/>'),
    settings: icon('<circle cx="12" cy="12" r="3"/><path d="M19 15.1a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.6V20a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6v-2.6h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9-.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1z"/>')
  };

  const pageNames = {
    dashboard: 'Dashboard',
    materials: 'Materiály',
    evidence: 'Evidence',
    dohledy: 'Dohledy',
    settings: 'Nastavení'
  };

  function applyDrawerIcons() {
    document.querySelectorAll('.mob-drawer-item[data-page]').forEach(item => {
      const page = item.dataset.page;
      if (item.querySelector('.drawer-icon')) return;
      const label = item.textContent
        .replace(/^\s*[🏠📚📋👁⚙️]+\s*/, '')
        .trim();
      const iconWrap = document.createElement('span');
      iconWrap.className = 'drawer-icon';
      iconWrap.innerHTML = icons[page] || icons.dashboard;
      const text = document.createElement('span');
      text.textContent = label;
      item.textContent = '';
      item.append(iconWrap, text);
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
    });
  }

  function syncNavigation() {
    const activeTab = document.querySelector('.ntab.active[data-page]');
    const activePage = activeTab ? activeTab.dataset.page : 'dashboard';

    document.querySelectorAll('.mob-drawer-item[data-page]').forEach(item => {
      item.classList.toggle('active', item.dataset.page === activePage);
      item.setAttribute('aria-current', item.dataset.page === activePage ? 'page' : 'false');
    });

    document.querySelectorAll('.sk-mobile-btn[data-page]').forEach(item => {
      item.classList.toggle('active', item.dataset.page === activePage);
    });

    const title = document.getElementById('mobPageTitle');
    if (title) title.textContent = pageNames[activePage] || activePage;
  }

  function closeDrawer() {
    const drawer = document.getElementById('mobDrawer');
    const overlay = document.getElementById('mobDrawerOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.classList.remove('drawer-open');
    const hb = document.getElementById('mobHbBtn');
    if (hb) hb.setAttribute('aria-expanded', 'false');
  }

  function openDrawer() {
    const drawer = document.getElementById('mobDrawer');
    const overlay = document.getElementById('mobDrawerOverlay');
    if (!drawer || !overlay) return;
    applyDrawerIcons();
    syncNavigation();
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('drawer-open');
    const hb = document.getElementById('mobHbBtn');
    if (hb) hb.setAttribute('aria-expanded', 'true');
  }

  function bindDrawer() {
    const hb = document.getElementById('mobHbBtn');
    const drawer = document.getElementById('mobDrawer');
    const overlay = document.getElementById('mobDrawerOverlay');
    const close = document.getElementById('mobDrawerClose');
    if (!drawer) return;

    /* Always start closed. This prevents the old post-login-open bug. */
    drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.classList.remove('drawer-open');

    if (hb && !hb.dataset.mobileNavBound) {
      hb.dataset.mobileNavBound = '1';
      hb.setAttribute('aria-expanded', 'false');
      hb.setAttribute('aria-controls', 'mobDrawer');
      hb.addEventListener('click', openDrawer);
    }
    if (close && !close.dataset.mobileNavBound) {
      close.dataset.mobileNavBound = '1';
      close.addEventListener('click', closeDrawer);
    }
    if (overlay && !overlay.dataset.mobileNavBound) {
      overlay.dataset.mobileNavBound = '1';
      overlay.addEventListener('click', closeDrawer);
    }

    document.querySelectorAll('.mob-drawer-item[data-page]').forEach(item => {
      if (item.dataset.mobileNavBound) return;
      item.dataset.mobileNavBound = '1';
      const activate = () => {
        const tab = document.querySelector('.ntab[data-page="' + item.dataset.page + '"]');
        if (tab) tab.click();
        syncNavigation();
        closeDrawer();
      };
      item.addEventListener('click', activate);
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  function bindBottomNav() {
    const bar = document.querySelector('.sk-mobile-bar');
    if (!bar || bar.dataset.mobileNavBound) return;
    bar.dataset.mobileNavBound = '1';
    bar.querySelectorAll('.sk-mobile-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = document.querySelector('.ntab[data-page="' + btn.dataset.page + '"]');
        if (tab) tab.click();
        syncNavigation();
      });
    });
  }

  function observeMainNavigation() {
    document.querySelectorAll('.ntab').forEach(tab => {
      const observer = new MutationObserver(syncNavigation);
      observer.observe(tab, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function boot() {
    applyDrawerIcons();
    bindDrawer();
    bindBottomNav();
    syncNavigation();
    observeMainNavigation();

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDrawer();
    });

    /* Firebase may replace the mobile avatar after login; keep the drawer visual-only. */
    const drawer = document.getElementById('mobDrawer');
    if (drawer) {
      const observer = new MutationObserver(() => {
        applyDrawerIcons();
        syncNavigation();
      });
      observer.observe(drawer, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
