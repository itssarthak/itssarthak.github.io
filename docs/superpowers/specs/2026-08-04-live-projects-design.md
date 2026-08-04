# Live Projects on Portfolio — Design

**Date:** 2026-08-04
**Status:** Approved approach; both GA4 properties verified accessible

## Goal

Add two personal live products — **askmyastro.in** and **filedownloader.in** — to the
portfolio page (`portfolio.html`) as cards in the existing systems grid, each showing
real usage numbers pulled from GA4 and refreshed automatically once a day.

## Decisions made

- **Data flow (Approach A):** a scheduled GitHub Action fetches GA4 numbers daily and
  commits them to a static JSON file. No runtime API calls from the browser, no new
  deployed endpoints. A commit auto-deploys via the existing Pages workflow.
- **Metric framing:** **all-time** totals (users, pageviews), labeled "all-time".
  30-day numbers are too small at current scale (askmyastro: 68 users/30d vs 1.1K
  all-time). All-time numbers only grow.
- **Credentials:** reuse the existing read-only service account
  `id-claude-marketing-readonly@wide-strength-502813-f8.iam.gserviceaccount.com`.
  Its key JSON becomes a GitHub Actions repo secret `GA4_SA_KEY`. Verified working
  against the askmyastro property via the Data API.
- **Property IDs:** askmyastro.in = `properties/541034254`; filedownloader.in =
  `properties/214739151` (access granted 2026-08-04, verified via Data API).
- **Filedownloader headline metric:** the property tracks a `file_download` event
  (539,901 all-time as of 2026-08-04) — shown as "540K+ downloads", far stronger
  than users/pageviews. The fetch script pulls `eventCount` filtered to
  `eventName = file_download` for this property in addition to users/pageviews.
- **GA4 date-range floor:** the Data API rejects startDate earlier than 2015-08-14;
  the script uses `2016-01-01` as the "all-time" start for both properties.

## Components

### 1. `assets/data/live-stats.json` (committed, machine-updated)

```json
{
  "updated": "2026-08-04",
  "askmyastro": { "users": 1101, "pageviews": 4696 },
  "filedownloader": { "users": 5933, "pageviews": 25820, "downloads": 539901 }
}
```

Numbers are all-time totals (GA4 `activeUsers`, `screenPageViews`, plus
`eventCount` for `file_download` on the filedownloader property; date range
2016-01-01 → today). A site absent from the file (or with zero users) means "no data
yet" and triggers the frontend fallback.

### 2. `scripts/fetch-live-stats.mjs`

Node 20+, zero npm dependencies. Reads the service-account JSON from env
`GA4_SA_KEY`, self-signs a JWT (RS256 via node:crypto), exchanges it for an access
token, calls `runReport` for each configured property, writes
`assets/data/live-stats.json`. Property config lives at the top of the script:
`{ askmyastro: '541034254', filedownloader: '214739151' }`.
A failing property is skipped with a warning, preserving that site's previous
JSON values.

### 3. `.github/workflows/live-stats.yml`

- Triggers: daily cron (`30 2 * * *` ≈ 8:00 IST) + `workflow_dispatch`.
- Steps: checkout → run script with `GA4_SA_KEY` secret → if `git diff` shows changes
  to `live-stats.json`, commit ("chore(stats): refresh live project stats"), push
  to main, then dispatch `pages.yml` explicitly via `gh workflow run` — required
  because GITHUB_TOKEN pushes do not fire `on: push` workflows (owner ruling,
  2026-08-04).
- Uses `permissions: contents: write` + `actions: write`; commits as github-actions bot.

### 4. `portfolio.html` — new standalone "personal projects" section

Personal products are independent from office projects and come FIRST (owner
decisions, 2026-08-04): their own section sits between the subpage hero and
the employer systems grid, using the existing `section-head` + `kicker` +
`section-title` pattern and a `systems-grid` of their own.

- Section heading: kicker `personal projects · live`, title with `grad-text`
  accent, one-line sub-copy claiming solo-built products with real traffic.
- **LIVE-001 / ASKMYASTRO.IN** — "AskMyAstro" — AI astrology Q&A product,
  link to https://askmyastro.in. Impact line: `<span data-stat="askmyastro">1.1K+ users
  · 4.7K views · all-time</span>` with a pulsing LIVE dot.
- **LIVE-002 / FILEDOWNLOADER.IN** — same treatment, link to
  https://filedownloader.in. Impact line headline: `540K+ downloads · 5.9K users
  · all-time`.

Because personal now leads, the hero sub-line ("Not side projects — …") is
generalized to cover both halves, and the employer grid gains its own
`section-head` (kicker `company work`) so it stays introduced. Footer counter
becomes `$ ls ./live ./systems → 10 results`. Card copy drafted by Claude,
corrected by owner.

### 5. Favicon swap (owner request, 2026-08-04)

The browser-tab icon becomes the portrait from the about section: every page
currently linking `./assets/images/logo.ico` (index, portfolio, resume,
contact, 404) switches to `<link rel="icon" type="image/png"
href="./assets/images/my-avatar.png">`. The header wordmark is unchanged.

### 6. Rendering (in `site.js`, guarded to run only when `[data-stat]` elements exist)

On the portfolio page, fetch `./assets/data/live-stats.json` (same-origin static
file), format numbers (1101 → "1.1K+"), and replace the text of `[data-stat]` spans.
The HTML ships with baked-in numbers from the latest committed JSON, so JS failure
just means numbers are as fresh as the last deploy — never blank.

### 7. Employment status update (owner request, 2026-08-04)

Owner left Stashfin; last working day 2026-07-28. Presentation ruling: "open to
opportunities" — no current-employer claim anywhere.

- `index.html`: hero status line becomes `open to opportunities · Gurgaon, India`;
  hero role drops "at Stashfin"; JSON-LD `worksFor` removed; bento metric tag
  `stashfin · live` → `stashfin · production`; timeline Stashfin entry becomes
  `FEB 2026 — JUL 2026` with the CURRENT badge and `current` class removed.
- `resume.html`: same timeline change.
- `assets/js/site.js`: terminal stream line "currently: … @ Stashfin" becomes
  "recently: architected a no-code AI agent platform @ Stashfin", followed by a
  new line "status: open to new opportunities".
- Historical mentions (meta descriptions, SYS-00x card labels) stay — they
  describe past work.

## Error handling

- **API/auth failure in the Action:** per-property failure warns and keeps the
  previous committed values for that property; if ANY configured site would end
  up with no data at all (fetch failed and no previous value exists), the script
  exits non-zero and writes nothing (owner ruling, 2026-08-04), so the committed
  JSON always contains both sites.
- **Browser:** fallback text is baked into the HTML; the JSON fetch failing changes
  nothing visible.

## Testing

- Run `scripts/fetch-live-stats.mjs` locally with the key from
  `~/.claude/secrets/ga-service-account.json` and verify JSON output matches the
  numbers from direct curl calls (1101 users / 4696 views as of 2026-08-04).
- Trigger the workflow manually via `workflow_dispatch` once the secret is set;
  verify commit + deploy.
- Load portfolio page locally; verify cards render with stats and degrade cleanly
  when the JSON is absent.

## Owner setup checklist

1. ~~Add SA as Viewer on filedownloader.in GA4 property~~ — done 2026-08-04.
2. Add repo secret `GA4_SA_KEY` = contents of `~/.claude/secrets/ga-service-account.json`.
3. Review card copy for both products.
