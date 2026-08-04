# Live Projects on Portfolio — Design

**Date:** 2026-08-04
**Status:** Approved approach; pending filedownloader.in GA access grant

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
- **Property IDs:** askmyastro.in = `properties/541034254`. filedownloader.in — not
  yet visible to the service account; owner must add the SA as **Viewer** under
  GA Admin → Property access management on that property. The pipeline tolerates the
  missing grant (see Error handling).

## Components

### 1. `assets/data/live-stats.json` (committed, machine-updated)

```json
{
  "updated": "2026-08-04",
  "askmyastro": { "users": 1101, "pageviews": 4696 },
  "filedownloader": { "users": 0, "pageviews": 0 }
}
```

Numbers are all-time totals (GA4 `activeUsers`, `screenPageViews`, date range
2020-01-01 → today). A site absent from the file (or with zero users) means "no data
yet" and triggers the frontend fallback.

### 2. `scripts/fetch-live-stats.mjs`

Node 20+, zero npm dependencies. Reads the service-account JSON from env
`GA4_SA_KEY`, self-signs a JWT (RS256 via node:crypto), exchanges it for an access
token, calls `runReport` for each configured property, writes
`assets/data/live-stats.json`. Property config lives at the top of the script:
`{ askmyastro: '541034254', filedownloader: null /* TODO: fill after grant */ }`.
A `null`/failing property is skipped with a warning, preserving that site's previous
JSON values.

### 3. `.github/workflows/live-stats.yml`

- Triggers: daily cron (`30 2 * * *` ≈ 8:00 IST) + `workflow_dispatch`.
- Steps: checkout → run script with `GA4_SA_KEY` secret → if `git diff` shows changes
  to `live-stats.json`, commit ("chore(stats): refresh live project stats") and push
  to main. Push triggers the existing Pages deploy workflow.
- Uses `permissions: contents: write`; commits as github-actions bot.

### 4. `portfolio.html` — two new cards

Inserted after the featured SYS-001 card:

- **SYS-009 / ASKMYASTRO.IN · LIVE** — "AskMyAstro" — AI astrology Q&A product,
  link to https://askmyastro.in. Impact line: `<span data-stat="askmyastro">1.1K+ users
  · 4.7K views · all-time</span>` with a pulsing LIVE dot.
- **SYS-010 / FILEDOWNLOADER.IN · LIVE** — same treatment, link to
  https://filedownloader.in. Until GA access lands, impact line shows a static
  "live on the open internet" line instead of numbers.

Copy adjustments: hero sub-line amended to claim personal live products; footer
counter `8 results` → `10 results`. Card copy drafted by Claude, corrected by owner.

### 5. Rendering (in `site.js`, guarded to run only when `[data-stat]` elements exist)

On the portfolio page, fetch `./assets/data/live-stats.json` (same-origin static
file), format numbers (1101 → "1.1K+"), and replace the text of `[data-stat]` spans.
The HTML ships with baked-in numbers from the latest committed JSON, so JS failure
just means numbers are as fresh as the last deploy — never blank.

## Error handling

- **API/auth failure in the Action:** script exits non-zero for total failure (no
  properties fetched) so the run is visibly red; per-property failure only warns and
  keeps the previous committed values for that property.
- **Missing filedownloader grant:** property configured as `null` → skipped silently
  until the owner grants access and the ID is filled in.
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

1. Add SA as Viewer on filedownloader.in GA4 property (only remaining data blocker).
2. Add repo secret `GA4_SA_KEY` = contents of `~/.claude/secrets/ga-service-account.json`.
3. Review card copy for both products.
