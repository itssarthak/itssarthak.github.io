// assets/js/analytics.js
// GA4 + custom behaviour tracking for sarthakchhabra.com
// ES5-compatible (matches the site's existing inline scripts). Safe on every page.
(function () {
  'use strict';

  var GA_ID = 'G-T4EHKQYQE3';

  // --- Filled in by the owner after deploying the Apps Script (see docs/analytics-setup.md) ---
  var SHEET_ENDPOINT = 'https://script.google.com/a/macros/sarthakchhabra.com/s/AKfycbzMIfNGNnj626MXalMZrhFiOZvFgr7fx6fJtj7KRcttJj2gf0amK2--g_7oSZRtMAho/exec';            // e.g. https://script.google.com/macros/s/AKfy.../exec
  var SHEET_TOKEN = '1_d5tjJjreVHbGrPlGwtWkr3aqpuD2HWU1GQAdOEf5D4';      // must match SHEET_TOKEN in Code.gs

  // ---- GA4 bootstrap ----
  var ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(ga);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  // transport_type 'beacon' makes unload-time events (section_engagement, form_abandon) reliable.
  gtag('config', GA_ID, { transport_type: 'beacon' });

  function track(name, params) { gtag('event', name, params || {}); }
  function nowMs() {
    return (window.performance && performance.now) ? performance.now() : Date.now();
  }

  // ---- Scroll depth: fire once per 25/50/75/100% threshold ----
  (function scrollDepth() {
    var marks = [25, 50, 75, 100];
    var sent = {};
    var ticking = false;
    function check() {
      ticking = false;
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      // -0.5 epsilon: sub-pixel rounding can leave pct at ~99.97 at the bottom,
      // which would otherwise never trip the 100% mark.
      var pct = (window.scrollY / scrollable) * 100;
      for (var i = 0; i < marks.length; i++) {
        if (pct >= marks[i] - 0.5 && !sent[marks[i]]) {
          sent[marks[i]] = true;
          track('scroll_depth', { percent: marks[i] });
        }
      }
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(check); }
    }, { passive: true });
  })();

  // ---- Section dwell time: accrue visible seconds per <section>, flush on exit/leave ----
  (function sectionDwell() {
    var sections = document.querySelectorAll('section');
    if (!sections.length || !('IntersectionObserver' in window)) return;
    var state = new Map();

    function nameFor(el, idx) {
      return el.id || el.getAttribute('aria-label') || ('section-' + idx);
    }
    sections.forEach(function (el, idx) {
      state.set(el, { name: nameFor(el, idx), visibleSince: 0, accrued: 0 });
    });

    function flush(el) {
      var st = state.get(el);
      if (st.visibleSince) { st.accrued += nowMs() - st.visibleSince; st.visibleSince = 0; }
      var secs = Math.round(st.accrued / 1000);
      if (secs >= 1) {
        track('section_engagement', { section: st.name, seconds: secs });
        st.accrued = 0;
      }
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var st = state.get(e.target);
        if (e.isIntersecting && e.intersectionRatio > 0.25) {
          if (!st.visibleSince) st.visibleSince = nowMs();
        } else if (st.visibleSince) {
          flush(e.target);
        }
      });
    }, { threshold: [0, 0.25, 0.5, 1] });

    sections.forEach(function (el) { io.observe(el); });
    window.addEventListener('pagehide', function () {
      sections.forEach(function (el) { flush(el); });
    });
  })();

  // ---- Outbound clicks: mailto, external hosts, and .pdf links ----
  (function outbound() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a || !a.getAttribute('href')) return;
      var href = a.getAttribute('href');
      var isMail = href.indexOf('mailto:') === 0;
      var isPdf = /\.pdf($|\?)/i.test(href);
      var external = a.host && a.host !== window.location.host;
      if (isMail || isPdf || external) track('outbound_click', { target: href });
    }, true);
  })();

  // ---- Contact form: start / submit / abandon + draft capture (contact.html only) ----
  (function contactForm() {
    var form = document.querySelector('[data-form]');
    if (!form) return; // not on the contact page

    var nameEl = document.getElementById('cf-name');
    var emailEl = document.getElementById('cf-email');
    var msgEl = document.getElementById('cf-message');

    var started = false;
    var submitted = false;
    var abandonReported = false;
    function val(el) { return el ? (el.value || '').replace(/^\s+|\s+$/g, '') : ''; }
    function hasContent() { return !!(val(nameEl) || val(emailEl) || val(msgEl)); }

    function onFirstInteract() {
      if (!started) { started = true; track('form_start', {}); }
    }
    [nameEl, emailEl, msgEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener('focus', onFirstInteract);
      el.addEventListener('input', onFirstInteract);
    });

    // Button is disabled until valid, so a real submit means valid data was sent.
    // NOTE: form_submit means "user clicked send with valid fields", NOT delivery
    // confirmation — EmailJS delivery success/failure is not observable from here.
    form.addEventListener('submit', function () {
      if (form.checkValidity && !form.checkValidity()) return;
      submitted = true;
      track('form_submit', {});
    });

    function reportAbandon() {
      // Tab close fires BOTH visibilitychange-hidden and pagehide; latch to fire once.
      if (abandonReported || !started || submitted || !hasContent()) return;
      abandonReported = true;
      var name = val(nameEl), email = val(emailEl), message = val(msgEl);
      track('form_abandon', {
        name_filled: !!name,
        email_filled: !!email,
        message_filled: !!message,
        message_len: message.length
      });
      if (SHEET_ENDPOINT && navigator.sendBeacon) {
        var payload = JSON.stringify({
          token: SHEET_TOKEN,
          ts: new Date().toISOString(),
          name: name,
          email: email,
          message: message,
          fields_filled: [name && 'name', email && 'email', message && 'message']
            .filter(Boolean).join(','),
          page: location.pathname,
          referrer: document.referrer
        });
        try {
          navigator.sendBeacon(SHEET_ENDPOINT, new Blob([payload], { type: 'text/plain' }));
        } catch (err) { /* never let tracking throw */ }
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') reportAbandon();
    });
    window.addEventListener('pagehide', reportAbandon);
  })();
})();
