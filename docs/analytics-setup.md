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
