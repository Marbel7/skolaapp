/* SkolaApp — dashboard simplification pass
 * Mobile-only presentation layer. Does not touch navigation, task logic or data.
 */
(function () {
  'use strict';
  if (window.__SKOLA_DASHBOARD_POLISH__) return;
  window.__SKOLA_DASHBOARD_POLISH__ = true;

  var style = document.createElement('style');
  style.textContent = `
    @media (max-width:700px){
      /* The dashboard should start with useful information, not a greeting. */
      #page-dashboard > .page-hdr{
        margin:0 4px 12px!important;
        padding:0!important;
      }
      #page-dashboard > .page-hdr h1,
      #page-dashboard > .page-hdr:after{
        display:none!important;
      }
      #page-dashboard > .page-hdr p{
        display:block!important;
        margin:0!important;
        padding:2px 0 0!important;
        color:#7C8198!important;
        font-size:15px!important;
        line-height:1.35!important;
        font-weight:600!important;
        letter-spacing:-.01em!important;
      }

      /* Remove the decorative percentage meter. The real 13 / 17 number remains. */
      #page-dashboard .grid2 > .card:nth-child(2)::before{
        content:none!important;
        display:none!important;
      }

      /* The task block is the primary dashboard object. Keep it compact and factual. */
      #page-dashboard .grid2 > .card:nth-child(2){
        padding:14px!important;
        border-radius:16px!important;
        box-shadow:0 2px 10px rgba(32,32,51,.05)!important;
      }
      #page-dashboard .grid2 > .card:nth-child(2) .card-hd{
        margin-bottom:9px!important;
      }
      #page-dashboard .grid2 > .card:nth-child(2) .card-sub{
        font-size:20px!important;
        font-weight:750!important;
      }
      #page-dashboard .grid2 > .card:nth-child(2) .tlist{
        gap:5px!important;
      }
      #page-dashboard .grid2 > .card:nth-child(2) .titem{
        min-height:44px!important;
        padding:8px 9px!important;
        border-radius:12px!important;
      }

      /* Quick links: 2-column utility grid, so the dashboard does not become a long directory. */
      #page-dashboard .grid2 > .card:first-child{
        padding:14px!important;
        border-radius:16px!important;
        box-shadow:0 2px 10px rgba(32,32,51,.05)!important;
      }
      #page-dashboard .grid2 > .card:first-child .card-hd{
        margin-bottom:9px!important;
      }
      #page-dashboard .grid2 > .card:first-child .card-ttl{
        font-size:13px!important;
        text-transform:none!important;
        letter-spacing:0!important;
        color:#202033!important;
      }
      #page-dashboard .grid2 > .card:first-child .card-sub{
        font-size:11px!important;
      }
      #page-dashboard .lgrid{
        grid-template-columns:1fr 1fr!important;
        gap:7px!important;
      }
      #page-dashboard .lbtn{
        min-height:58px!important;
        padding:9px!important;
        border-radius:12px!important;
        background:#fff!important;
      }
      #page-dashboard .li{
        width:32px!important;
        height:32px!important;
        flex:0 0 32px!important;
      }
      #page-dashboard .ln{font-size:12px!important;}
      #page-dashboard .ld{font-size:9px!important;}
      #page-dashboard .la{opacity:1!important;font-size:10px!important;}
      #page-dashboard .ladd{grid-column:1/-1!important;min-height:40px!important;}

      /* Notes stay below the dashboard essentials, with no oversized empty space. */
      #page-dashboard > div[style*="grid-template-columns:1fr 300px"] > div:first-child > .card:last-child{
        margin-top:9px!important;
        padding:14px!important;
        border-radius:16px!important;
      }
      #page-dashboard > div[style*="grid-template-columns:1fr 300px"] > div:first-child > .card:last-child .card-hd{
        margin-bottom:9px!important;
      }
      #page-dashboard > div[style*="grid-template-columns:1fr 300px"] > div:first-child > .card:last-child .ninput{
        min-height:70px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
