// Code.gs — Google Apps Script web app.
// Bound to a Google Sheet; appends one row per abandoned contact-form draft.
// Deploy: Extensions > Apps Script in a blank Sheet, paste this, Deploy > New deployment >
// type "Web app", execute as "Me", access "Anyone". Copy the /exec URL into analytics.js.

var SHEET_TOKEN = 'CHANGE_ME'; // MUST match SHEET_TOKEN in assets/js/analytics.js
var MAX = { name: 200, email: 200, message: 5000 };

function cap(v, n) { return String(v == null ? '' : v).slice(0, n); }

function doPost(e) {
  var ok = ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data || data.token !== SHEET_TOKEN) return ok; // reject silently, write nothing

    // Serialise concurrent beacons so the header check and appends can't interleave.
    var lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['timestamp', 'name', 'email', 'message', 'fields_filled', 'page', 'referrer']);
      }
      sheet.appendRow([
        cap(data.ts, 40),
        cap(data.name, MAX.name),
        cap(data.email, MAX.email),
        cap(data.message, MAX.message),
        cap(data.fields_filled, 60),
        cap(data.page, 200),
        cap(data.referrer, 300)
      ]);
    } finally {
      lock.releaseLock();
    }
  } catch (err) { /* swallow — a beacon must never receive an error */ }
  return ok;
}
