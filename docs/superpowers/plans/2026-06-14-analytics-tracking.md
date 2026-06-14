# Analytics & Behavior Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install GA4 (currently absent) on the portfolio and add custom tracking for scroll depth, per-section dwell time, outbound clicks, and contact-form behavior — including capturing the actual text of abandoned form drafts to a private Google Sheet.

**Architecture:** One shared `assets/js/analytics.js` bootstraps gtag (`G-T4EHKQYQE3`) and runs all client tracking; it is included on every page via a `defer` script tag matching the site's existing `./assets/js/*.js` convention. Abandoned-draft text is the only signal leaving GA4 — it is POSTed via `navigator.sendBeacon` (as `text/plain` to avoid a CORS preflight) to a Google Apps Script web app that validates a shared token and appends rows to a bound Sheet.

**Tech Stack:** Vanilla ES5-compatible JS (matches existing inline scripts), Google Analytics 4 (gtag.js), Google Apps Script. Static site, no build step. No test framework exists, so verification uses `node --check` for syntax and manual GA4 DebugView / Sheet checks.

---

## File Structure

**New**
- `assets/js/analytics.js` — all client-side tracking (GA4 bootstrap, scroll, section dwell, outbound, contact form + draft beacon).
- `Code.gs` — Apps Script source kept in repo for reference; the live copy lives in the Sheet's script editor.
- `docs/analytics-setup.md` — owner setup: GA4 custom-dimension registration + Apps Script deploy steps + where to paste the URL/token.

**Edited (one `<script>` line each)**
- `index.html`, `portfolio.html`, `resume.html`, `contact.html`, `404.html`, `ollama.html` — reachable pages.
- `home.html`, `error.html` — legacy template pages; include for completeness (harmless).

**No edit** to `contact.html`'s inline EmailJS handler — `analytics.js` attaches its own `submit` listener.

---

## Task 1: Create `analytics.js` (GA4 bootstrap + scroll + section dwell + outbound)

**Files:**
- Create: `assets/js/analytics.js`

- [ ] **Step 1: Write the file with bootstrap and the three page-level trackers**

```javascript
// assets/js/analytics.js
// GA4 + custom behaviour tracking for sarthakchhabra.com
// ES5-compatible (matches the site's existing inline scripts). Safe on every page.
(function () {
  'use strict';

  var GA_ID = 'G-T4EHKQYQE3';

  // --- Filled in by the owner after deploying the Apps Script (see docs/analytics-setup.md) ---
  var SHEET_ENDPOINT = '';            // e.g. https://script.google.com/macros/s/AKfy.../exec
  var SHEET_TOKEN = 'CHANGE_ME';      // must match SHEET_TOKEN in Code.gs

  // ---- GA4 bootstrap ----
  var ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(ga);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);

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
      var pct = (window.scrollY / scrollable) * 100;
      for (var i = 0; i < marks.length; i++) {
        if (pct >= marks[i] && !sent[marks[i]]) {
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

  // ---- Contact form tracking is added in Task 2 below this line ----
})();
```

- [ ] **Step 2: Verify the file parses**

Run: `node --check assets/js/analytics.js`
Expected: no output, exit code 0 (syntax OK).

- [ ] **Step 3: Commit**

```bash
git add assets/js/analytics.js
git commit -m "feat(analytics): add GA4 bootstrap, scroll depth, section dwell, outbound tracking"
```

---

## Task 2: Add contact-form tracking + abandoned-draft beacon to `analytics.js`

**Files:**
- Modify: `assets/js/analytics.js` (insert before the final `})();` and the closing comment from Task 1)

- [ ] **Step 1: Replace the placeholder comment with the contact-form block**

Find this line near the end of `assets/js/analytics.js`:

```javascript
  // ---- Contact form tracking is added in Task 2 below this line ----
```

Replace that single line with:

```javascript
  // ---- Contact form: start / submit / abandon + draft capture (contact.html only) ----
  (function contactForm() {
    var form = document.querySelector('[data-form]');
    if (!form) return; // not on the contact page

    var nameEl = document.getElementById('cf-name');
    var emailEl = document.getElementById('cf-email');
    var msgEl = document.getElementById('cf-message');

    var started = false;
    var submitted = false;
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
    form.addEventListener('submit', function () {
      if (form.checkValidity && !form.checkValidity()) return;
      submitted = true;
      track('form_submit', {});
    });

    function reportAbandon() {
      if (!started || submitted || !hasContent()) return;
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
```

- [ ] **Step 2: Verify the file still parses**

Run: `node --check assets/js/analytics.js`
Expected: no output, exit code 0.

- [ ] **Step 3: Confirm both config constants and all event names are present**

Run: `grep -nE "SHEET_ENDPOINT|SHEET_TOKEN|form_start|form_submit|form_abandon|section_engagement|scroll_depth|outbound_click" assets/js/analytics.js`
Expected: each name appears at least once.

- [ ] **Step 4: Commit**

```bash
git add assets/js/analytics.js
git commit -m "feat(analytics): track contact form start/submit/abandon and beacon abandoned drafts"
```

---

## Task 3: Create the Apps Script (`Code.gs`)

**Files:**
- Create: `Code.gs`

- [ ] **Step 1: Write the Apps Script web app**

```javascript
// Code.gs — Google Apps Script web app.
// Bound to a Google Sheet; appends one row per abandoned contact-form draft.
// Deploy: Extensions > Apps Script in a blank Sheet, paste this, Deploy > New deployment >
// type "Web app", execute as "Me", access "Anyone". Copy the /exec URL into analytics.js.

var SHEET_TOKEN = 'CHANGE_ME'; // MUST match SHEET_TOKEN in assets/js/analytics.js
var MAX = { name: 200, email: 200, message: 5000 };

function doPost(e) {
  var ok = ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data || data.token !== SHEET_TOKEN) return ok; // reject silently, write nothing

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['timestamp', 'name', 'email', 'message', 'fields_filled', 'page', 'referrer']);
    }
    function cap(v, n) { return String(v == null ? '' : v).slice(0, n); }
    sheet.appendRow([
      cap(data.ts, 40),
      cap(data.name, MAX.name),
      cap(data.email, MAX.email),
      cap(data.message, MAX.message),
      cap(data.fields_filled, 60),
      cap(data.page, 200),
      cap(data.referrer, 300)
    ]);
  } catch (err) { /* swallow — a beacon must never receive an error */ }
  return ok;
}
```

- [ ] **Step 2: Verify it parses as JS**

Run: `node --check Code.gs`
Expected: no output, exit code 0. (Apps Script globals are undefined under node, but `--check` validates syntax only.)

- [ ] **Step 3: Commit**

```bash
git add Code.gs
git commit -m "feat(analytics): add Apps Script web app for abandoned-draft capture"
```

---

## Task 4: Include `analytics.js` on every page

**Files:**
- Modify: `index.html`, `portfolio.html`, `resume.html`, `contact.html`, `404.html`, `ollama.html`, `home.html`, `error.html`

- [ ] **Step 1: Add the script tag immediately before `</head>` on each page**

The tag to insert (identical on every page):

```html
    <script src="./assets/js/analytics.js" defer></script>
```

Insert it on the line directly above `</head>` in each of the eight files. Example for `index.html` — change:

```html
</head>
```

to:

```html
    <script src="./assets/js/analytics.js" defer></script>
</head>
```

Repeat the identical insertion in: `portfolio.html`, `resume.html`, `contact.html`, `404.html`, `ollama.html`, `home.html`, `error.html`.

- [ ] **Step 2: Verify all eight pages reference the script exactly once**

Run: `grep -c "assets/js/analytics.js" index.html portfolio.html resume.html contact.html 404.html ollama.html home.html error.html`
Expected: every file reports `1`.

- [ ] **Step 3: Verify each insertion sits inside the head (before `</head>`)**

Run: `for f in index.html portfolio.html resume.html contact.html 404.html ollama.html home.html error.html; do awk '/analytics\.js/{a=NR} /<\/head>/{h=NR} END{print FILENAME": script@"a" head-close@"h" "(a&&h&&a<h?"OK":"CHECK")}' "$f"; done`
Expected: every line ends with `OK`.

- [ ] **Step 4: Commit**

```bash
git add index.html portfolio.html resume.html contact.html 404.html ollama.html home.html error.html
git commit -m "feat(analytics): load analytics.js on all pages"
```

---

## Task 5: Write the owner setup guide

**Files:**
- Create: `docs/analytics-setup.md`

- [ ] **Step 1: Write the setup doc**

```markdown
# Analytics setup (one-time owner steps)

After the code is deployed, two manual steps make everything live.

## A. Google Apps Script (captures abandoned form drafts)

1. Create a new blank Google Sheet (e.g. "Contact form drafts").
2. In the Sheet: **Extensions → Apps Script**.
3. Delete the default code, paste the contents of `Code.gs` from this repo.
4. Pick a shared secret and set it in **both** places (any random string):
   - `Code.gs` → `SHEET_TOKEN`
   - `assets/js/analytics.js` → `SHEET_TOKEN`
5. **Deploy → New deployment → Type: Web app.** Execute as **Me**, Who has access **Anyone**. Deploy.
6. Copy the **Web app URL** (ends in `/exec`).
7. Paste it into `assets/js/analytics.js` → `SHEET_ENDPOINT`. Commit and push.

> Security note: "Anyone" access is required for a visitor's `sendBeacon` to reach the script.
> The token lives in public client JS so it is a spam deterrent, not a true secret. The endpoint
> is write-only (it never returns Sheet contents); worst case is junk rows you can delete.

## B. GA4 custom dimensions (makes custom params show in reports)

Data is captured regardless; this only makes the params reportable in the GA4 UI.

GA4 → **Admin → Custom definitions → Create custom dimensions** (scope: Event):

| Dimension name | Event parameter |
|---|---|
| Section          | `section` |
| Scroll percent   | `percent` |
| Outbound target  | `target` |
| Name filled      | `name_filled` |
| Email filled     | `email_filled` |
| Message filled   | `message_filled` |

And **custom metrics** (scope: Event):

| Metric name      | Event parameter | Unit |
|---|---|---|
| Section seconds  | `seconds` | Standard |
| Message length   | `message_len` | Standard |

Allow up to 24–48h for these to populate in standard reports. Use **Admin → DebugView**
(with the GA Debugger extension) to confirm events fire immediately during testing.

## Events emitted

`page_view` (auto), `session_start` (auto), `scroll_depth`, `section_engagement`,
`outbound_click`, `form_start`, `form_submit`, `form_abandon`.
```

- [ ] **Step 2: Commit**

```bash
git add docs/analytics-setup.md
git commit -m "docs(analytics): add owner setup guide for Apps Script and GA4 dimensions"
```

---

## Task 6: Local verification

**Files:** none (verification only)

- [ ] **Step 1: Serve the site locally**

Run: `python3 -m http.server 8000`
Then open `http://localhost:8000/` in a browser. (Stop the server with Ctrl-C when done.)

- [ ] **Step 2: Confirm GA4 loads and no JS errors**

In the browser DevTools **Network** tab, filter `gtag` — expect a request to
`googletagmanager.com/gtag/js?id=G-T4EHKQYQE3`. Check the **Console** tab: expect no errors
from `analytics.js`.

- [ ] **Step 3: Confirm custom events fire**

With the **GA Debugger** extension on (or `?debug_mode=1`), open **GA4 → Admin → DebugView**.
Scroll the home page top-to-bottom and confirm `scroll_depth` (25/50/75/100) and
`section_engagement` (sections `proof`, `systems`, `timeline`, etc.) appear. Click the email /
GitHub / resume-PDF links and confirm `outbound_click`.

- [ ] **Step 4: Confirm contact-form flows (requires SHEET_ENDPOINT set — do after Task 5 deploy)**

On `/contact.html`: type into name + message, then switch tabs.
Expected: a row appears in the Google Sheet **and** `form_abandon` shows in DebugView.
Then reload, fill all fields validly, click **Send** with EmailJS configured.
Expected: `form_submit` fires and **no** new abandon row is written.

- [ ] **Step 5: Final confirmation**

Confirm steps 1–4 pass. If `SHEET_ENDPOINT` is still empty (deploy not yet done), the beacon is
skipped by design and only the GA4 events are verified — note this and revisit Step 4 after deploy.

---

## Self-Review notes (addressed)

- **Spec coverage:** reach/pages → GA4 auto (Task 1); section time → `section_engagement` (Task 1);
  scroll → `scroll_depth` (Task 1); outbound → Task 1; form stats → `form_start/submit/abandon`
  (Task 2); abandoned text → beacon + `Code.gs` (Tasks 2–3); no consent banner → none added;
  setup steps → Task 5. All spec sections map to a task.
- **Token name consistency:** `SHEET_TOKEN` / `SHEET_ENDPOINT` identical across `analytics.js`
  and `Code.gs`; event names identical between emitter (Task 1–2) and setup doc (Task 5).
- **Config placeholders:** `SHEET_ENDPOINT`/`SHEET_TOKEN` are intentionally owner-supplied at
  deploy time (Task 5), not plan gaps; all behavioural code is complete.
```
