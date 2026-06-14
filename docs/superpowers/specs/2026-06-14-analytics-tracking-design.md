# Analytics & Behavior Tracking — Design

**Date:** 2026-06-14
**Status:** Approved (design)
**Site:** sarthakchhabra.com (static, GitHub Pages, no build step)

## Problem

The site collects no analytics. The GA4 snippet (`G-T4EHKQYQE3`) the owner believed
was installed is **not present in the repo** — no `gtag`, `googletagmanager`, or the
measurement ID appears in any HTML/JS/CSS file. The site is therefore reporting zero data.

The owner wants to know:
- How many people reach the site, and from where.
- Which pages/content they read.
- How much time they spend on each **part** (section) of a page.
- When someone types into the contact form but never sends it — including the **actual
  text** they typed.

## Decisions (locked)

- **Stack:** GA4 only, with custom events. No Microsoft Clarity.
- **Consent:** No cookie banner. Analytics loads for everyone immediately.
- **Abandoned form drafts:** Capture the **actual typed text**, sent to a **Google Sheet**
  via a Google Apps Script web app (not GA4 — GA4 forbids personal data).

## Architecture

A single shared script, `assets/js/analytics.js`, bootstraps GA4 and runs all custom
tracking. It is included once per page via `<script src="/assets/js/analytics.js" defer></script>`
in the `<head>`. Abandoned-draft text is the only signal that leaves GA4; it is POSTed via
`navigator.sendBeacon` to an Apps Script endpoint that appends rows to a private Sheet.

```
                ┌─────────────────────────────────────────┐
   every page → │ assets/js/analytics.js                   │
                │  • gtag bootstrap (G-T4EHKQYQE3)         │ → GA4
                │  • scroll depth                          │ → GA4
                │  • section dwell (IntersectionObserver)  │ → GA4
                │  • outbound click tracking               │ → GA4
                │  • contact form: start/submit/abandon    │ → GA4 (stats)
                │  • abandoned draft text (sendBeacon)     │ → Apps Script → Google Sheet
                └─────────────────────────────────────────┘
```

## Components

### 1. GA4 bootstrap
`analytics.js` injects the gtag loader for `G-T4EHKQYQE3`, defines `gtag()`, and calls
`gtag('js', new Date())` / `gtag('config', 'G-T4EHKQYQE3')`. Enhanced Measurement (default
on in GA4) covers `page_view`, `session_start`, outbound clicks, and file downloads
automatically; custom events below add the rest.

### 2. Scroll depth
Throttled `scroll` listener fires `scroll_depth` once per threshold crossed (25/50/75/100%),
param `percent`. State resets per page load.

### 3. Section dwell time
`IntersectionObserver` over `section` elements. Section name resolves as:
`section.id` → `section[aria-label]` → `section-<index>`. Accumulate visible wall-clock
seconds while a section's intersectionRatio is above a small threshold; flush a
`section_engagement` event (params `section`, `seconds`) when the section leaves the
viewport and once more for all visible sections on page-leave (`visibilitychange`→hidden /
`pagehide`). Seconds rounded to integer; sections with < 1s of engagement are not sent.

### 4. Outbound clicks
Delegated `click` listener on `document`. For anchors to mailto:, external hosts, or the
resume PDF, fire `outbound_click` with param `target` (the href or a friendly label).

### 5. Contact form tracking (`contact.html` only)
Fields: `#cf-name` (fullname), `#cf-email` (email), `#cf-message` (message). The page
already wires EmailJS submit via `[data-form]` / `[data-form-input]`.

- `form_start` — fired once on first focus or keystroke in any field.
- `form_submit` — fired from inside the existing EmailJS success path; sets `submitted = true`.
- `form_abandon` — on page-leave, if `started && !submitted && hasContent`, fire with params:
  `name_filled` (bool), `email_filled` (bool), `message_filled` (bool), `message_len` (int).

### 6. Abandoned draft text → Google Sheet
- Latest field values are held in memory and updated on `input`.
- On `visibilitychange`→hidden or `pagehide`: if `started && !submitted` and any field has
  meaningful content, build a payload and `navigator.sendBeacon(SHEET_ENDPOINT, blob)` where
  blob is a `Blob([...], { type: 'text/plain' })` containing JSON (text/plain avoids a CORS
  preflight that would break sendBeacon to Apps Script).
- Payload: `{ ts, name, email, message, fields_filled, page, referrer }`.
- `submitted` flag (set in the EmailJS success path) suppresses the beacon, so only genuine
  abandonments are logged — one row, reflecting the latest typed state.

`Code.gs` (kept in repo for reference): `doPost(e)` parses `e.postData.contents` as JSON and
`appendRow` to the bound Sheet with a header row (`timestamp, name, email, message,
fields_filled, page, referrer`). Deployed as a web app executing as the owner, accessible to
"Anyone" (required for the beacon; URL is unguessable and only ever receives writes).

## Files

**New**
- `assets/js/analytics.js` — all client tracking.
- `Code.gs` — Apps Script source (reference copy; the live copy lives in the Sheet's editor).
- `docs/analytics-setup.md` — GA4 custom-dimension registration steps + Apps Script deploy guide.

**Edited**
- `index.html`, `portfolio.html`, `resume.html`, `contact.html`, `ollama.html`, `home.html`,
  `404.html` (and `error.html` if still linked): add the one `<script>` line.
- `contact.html`: hook `form_submit` into the existing EmailJS success callback (no change to
  email delivery) — done from `analytics.js`, ideally with no edit to the inline handler if the
  submit event can be observed; otherwise a minimal hook.

**Config constant**
- `SHEET_ENDPOINT` in `analytics.js` — the deployed Apps Script web-app URL (owner pastes after deploy).

## Owner setup steps (documented, not code)
1. GA4 → Admin → Custom definitions → register dimensions `section`, `percent`, `target`,
   `name_filled`, `email_filled`, `message_filled`, and metric `seconds` / `message_len`.
2. Create a blank Google Sheet → Extensions → Apps Script → paste `Code.gs` → Deploy as web
   app (execute as me, access Anyone) → copy URL → paste into `SHEET_ENDPOINT`.

## Out of scope (YAGNI)
- Consent banner / CMP.
- Microsoft Clarity, Hotjar, session replay.
- Server-side tagging, GTM container.
- Real-time dashboards beyond GA4's own UI.

## Privacy note
No consent banner (owner's decision; common for a personal portfolio, not strictly GDPR-
compliant). Abandoned-draft capture stores real names/emails/messages in the owner's private
Sheet — personal data the owner is now responsible for. Endpoint restricted to the owner's
Google account; Sheet not shared.

## Testing
- Local: serve the site, confirm `gtag` network calls fire (GA4 DebugView), scroll thresholds
  and section events appear, outbound clicks register.
- Form: type in fields, switch tabs → confirm a row lands in the Sheet and `form_abandon` in
  GA4 DebugView; then submit normally → confirm `form_submit` fires and **no** abandon row is
  written.
