/* Modern mobile hamburger drawer — visual layer only */
(function () {
  'use strict';
  if (window.__SKOLA_HAMBURGER_MODERN__) return;
  window.__SKOLA_HAMBURGER_MODERN__ = true;

  const css = document.createElement('style');
  css.textContent = `
    @media (max-width: 600px) {
      :root {
        --drawer-primary: #6C5CE7;
        --drawer-primary-soft: #F0EEFF;
        --drawer-ink: #202033;
        --drawer-muted: #737991;
        --drawer-border: #E8E8F0;
      }

      .mob-drawer-overlay {
        background: rgba(18, 20, 34, .48) !important;
        backdrop-filter: blur(2px) !important;
        -webkit-backdrop-filter: blur(2px) !important;
      }

      .mob-drawer {
        width: min(86vw, 340px) !important;
        max-width: 340px !important;
        background: #fff !important;
        border-right: 1px solid var(--drawer-border) !important;
        border-radius: 0 24px 24px 0 !important;
        box-shadow: 10px 0 38px rgba(18, 20, 34, .16) !important;
        overflow: hidden !important;
      }

      .mob-drawer-hd {
        min-height: 78px !important;
        padding: max(14px, env(safe-area-inset-top)) 18px 14px !important;
        padding-top: max(14px, calc(env(safe-area-inset-top) + 10px)) !important;
        gap: 12px !important;
        border-bottom: 1px solid var(--drawer-border) !important;
        background: #fff !important;
      }

      .mob-drawer-hd img {
        width: 40px !important;
        height: 40px !important;
        border-radius: 12px !important;
        box-shadow: 0 3px 10px rgba(108,92,231,.14) !important;
      }

      .mob-drawer-hd > span {
        font-size: 15px !important;
        font-weight: 750 !important;
        letter-spacing: -.015em !important;
        color: var(--drawer-ink) !important;
      }

      .mob-drawer-close {
        width: 38px !important;
        height: 38px !important;
        margin-left: auto !important;
        padding: 0 !important;
        border: 1px solid var(--drawer-border) !important;
        border-radius: 12px !important;
        background: #F7F7FA !important;
        color: #737991 !important;
        font-size: 18px !important;
        line-height: 1 !important;
        display: grid !important;
        place-items: center !important;
      }
      .mob-drawer-close:active { transform: scale(.96); }

      .mob-drawer-nav {
        padding: 14px 12px !important;
        overflow-y: auto !important;
      }

      .mob-drawer-item {
        min-height: 54px !important;
        margin: 3px 0 !important;
        padding: 7px 12px !important;
        border-radius: 15px !important;
        gap: 12px !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        color: var(--drawer-muted) !important;
        transition: background .16s ease, color .16s ease, transform .12s ease !important;
      }

      .mob-drawer-item .drawer-icon {
        width: 40px;
        height: 40px;
        flex: 0 0 40px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: #F5F5F9;
        color: #737991;
        transition: background .16s ease, color .16s ease, transform .16s ease;
      }
      .mob-drawer-item .drawer-icon svg {
        width: 20px;
        height: 20px;
        display: block;
      }
      .mob-drawer-item:hover {
        background: #F7F7FA !important;
        color: var(--drawer-ink) !important;
      }
      .mob-drawer-item:active { transform: scale(.985); }
      .mob-drawer-item.active {
        background: var(--drawer-primary-soft) !important;
        color: var(--drawer-primary) !important;
        font-weight: 700 !important;
      }
      .mob-drawer-item.active .drawer-icon {
        background: #fff !important;
        color: var(--drawer-primary) !important;
        box-shadow: 0 2px 8px rgba(108,92,231,.10);
      }

      .mob-drawer-foot {
        padding: 12px 14px calc(12px + env(safe-area-inset-bottom)) !important;
        border-top: 1px solid var(--drawer-border) !important;
        background: #fff !important;
      }

      #fbSignOutBtnMob {
        min-height: 44px !important;
        border-radius: 13px !important;
        font-weight: 650 !important;
        color: var(--drawer-muted) !important;
        background: #F7F7FA !important;
        border-color: var(--drawer-border) !important;
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
    settings: icon('<circle cx="12" cy="12" r="3"/><path d="M19 15.1a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.6V20a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.6h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v2.6h-.2a1.7 1.7 0 0 0 1.5 1z"/>')
  };

  function applyDrawerIcons() {
    document.querySelectorAll('.mob-drawer-item').forEach(item => {
      const page = item.dataset.page;
      if (!page || item.querySelector('.drawer-icon')) return;
      const label = item.textContent.replace(/^\s*[🏠📚📋👁⚙️]+\s*/, '').trim();
      item.textContent = '';
      const iconWrap = document.createElement('span');
      iconWrap.className = 'drawer-icon';
      iconWrap.innerHTML = icons[page] || icons.dashboard;
      const text = document.createElement('span');
      text.textContent = label;
      item.append(iconWrap, text);
    });
  }

  const boot = () => {
    applyDrawerIcons();
    const drawer = document.getElementById('mobDrawer');
    if (!drawer) return;
    const observer = new MutationObserver(applyDrawerIcons);
    observer.observe(drawer, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
