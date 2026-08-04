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
8. **Verify:** open the live contact page, type into the form, switch tabs, then check the
   Sheet for a new row. No row = the two `SHEET_TOKEN` values don't match, or `SHEET_ENDPOINT`
   is wrong/empty. (A bad token is rejected silently, so this test is the only signal.)

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

## C. Live project stats pipeline (daily GA4 pull)

`scripts/fetch-live-stats.mjs` pulls all-time usage numbers for the two live
personal projects and writes them to `assets/data/live-stats.json`, which
`portfolio.html` renders via `assets/js/site.js`.

1. Create a Google Cloud service account with access to the GA4 Data API and
   download its JSON key.
2. In GA4, grant that service account **Viewer** access on both properties:
   - askmyastro — property `541034254`
   - filedownloader — property `214739151`
3. Add the key JSON as a repo secret named `GA4_SA_KEY`:
   ```bash
   gh secret set GA4_SA_KEY < path/to/service-account.json
   ```
4. `.github/workflows/live-stats.yml` runs the script daily at 02:30 UTC and
   can also be triggered manually (`workflow_dispatch` / **Run workflow** in
   the Actions tab). It commits `assets/data/live-stats.json` only when the
   numbers actually changed, then dispatches `pages.yml` to redeploy.
5. Locally, the script reads the same key from `GA4_SA_KEY_FILE` (a path) or
   `GA4_SA_KEY` (raw JSON) instead of the repo secret.
