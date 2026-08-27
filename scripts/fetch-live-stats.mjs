/* Fetches all-time GA4 stats for live projects and writes assets/data/live-stats.json.
   Auth: service-account JSON from $GA4_SA_KEY (raw JSON) or $GA4_SA_KEY_FILE (path). */
import { createSign } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const PROPERTIES = {
  askmyastro: "541034254",
  filedownloader: "214739151",
};
const START_DATE = "2016-01-01"; // GA4 Data API rejects anything before 2015-08-14
/* Switchboard ships as a Claude Code plugin, so there is no download counter — a
   `/plugin marketplace add` is a git clone, and GitHub's traffic API is the only
   count of those. It keeps just 14 days, so every run merges the window into a
   per-day history here; miss ~2 weeks of runs and those days are gone for good. */
const GH_REPO = "itssarthak/claudecode-switchboard";
const CLONE_HISTORY_DAYS = 365;
const OUT_URL = new URL("../assets/data/live-stats.json", import.meta.url);

/* Daily trend series: each product charts its own headline metric, so the two are
   never plotted on a shared axis. 30 days is the widest window the UI offers. */
const SERIES_DAYS = 30;
const SERIES_METRIC = { askmyastro: "users", filedownloader: "downloads" };

/* Merge a fresh 14-day traffic window into the stored history. The API is
   authoritative for the days it covers (today's row keeps growing), so those
   overwrite; older days are kept untouched rather than re-counted. */
function mergeDays(previous, window) {
  const days = { ...previous };
  for (const row of window) days[row.timestamp.slice(0, 10)] = [row.count, row.uniques];
  return Object.fromEntries(Object.entries(days).sort().slice(-CLONE_HISTORY_DAYS));
}

async function gh(path) {
  const token = process.env.GH_TRAFFIC_TOKEN;
  if (!token) throw new Error("set GH_TRAFFIC_TOKEN (needs Administration:read on the repo)");
  const res = await fetch(`https://api.github.com/repos/${GH_REPO}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GET ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchSwitchboard(previous) {
  const [traffic, repo] = await Promise.all([gh("/traffic/clones"), gh("")]);
  const days = mergeDays(previous?.days, traffic.clones || []);
  const totals = Object.values(days);
  return {
    clones: totals.reduce((n, d) => n + d[0], 0),
    uniques: totals.reduce((n, d) => n + d[1], 0),
    stars: repo.stargazers_count || 0,
    days,
  };
}

function b64url(str) {
  return Buffer.from(str).toString("base64url");
}

async function loadServiceAccount() {
  if (process.env.GA4_SA_KEY) return JSON.parse(process.env.GA4_SA_KEY);
  if (process.env.GA4_SA_KEY_FILE)
    return JSON.parse(await readFile(process.env.GA4_SA_KEY_FILE, "utf8"));
  throw new Error("set GA4_SA_KEY (json) or GA4_SA_KEY_FILE (path)");
}

async function getAccessToken() {
  const sa = await loadServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${signer.sign(sa.private_key, "base64url")}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function runReport(token, propertyId, body) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`runReport ${propertyId}: ${res.status} ${await res.text()}`);
  return res.json();
}

const metric = (report, i) => Number(report.rows?.[0]?.metricValues?.[i]?.value ?? 0);

const ymd = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

/* Daily values for one product's headline metric, densified: GA4 omits rows for days
   with no activity, and a chart needs one slot per day or the x-axis lies. */
async function fetchSeries(token, propertyId, name) {
  const isDownloads = SERIES_METRIC[name] === "downloads";
  const report = await runReport(token, propertyId, {
    dateRanges: [{ startDate: `${SERIES_DAYS}daysAgo`, endDate: "yesterday" }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: isDownloads ? "eventCount" : "activeUsers" }],
    ...(isDownloads && {
      dimensionFilter: {
        filter: { fieldName: "eventName", stringFilter: { value: "file_download" } },
      },
    }),
  });
  if (!report.rows?.length) throw new Error(`empty series for property ${propertyId}`);

  const byDate = new Map(
    report.rows.map((r) => {
      const raw = r.dimensionValues[0].value; // GA4 returns YYYYMMDD
      const iso = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      return [iso, Number(r.metricValues[0].value) || 0];
    })
  );
  /* Anchor the window to the newest row GA4 actually returned, not to this machine's
     clock: "yesterday" resolves in the property's timezone, which can be a day ahead
     of UTC here, and anchoring locally would silently truncate the newest day. Fall
     back to the local yesterday when the last days were quiet enough to have no rows. */
  const newestRow = [...byDate.keys()].sort().pop();
  const localYesterday = ymd(addDays(new Date(), -1));
  const end = new Date(newestRow > localYesterday ? newestRow : localYesterday);
  const from = addDays(end, -(SERIES_DAYS - 1));
  const values = [];
  for (let i = 0; i < SERIES_DAYS; i++) values.push(byDate.get(ymd(addDays(from, i))) ?? 0);
  return { metric: SERIES_METRIC[name], from: ymd(from), values };
}

async function fetchSite(token, propertyId, withDownloads) {
  const totals = await runReport(token, propertyId, {
    dateRanges: [{ startDate: START_DATE, endDate: "today" }],
    metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
  });
  const site = { users: metric(totals, 0), pageviews: metric(totals, 1) };
  if (!site.users) throw new Error(`empty report for property ${propertyId}`);
  if (withDownloads) {
    const dl = await runReport(token, propertyId, {
      dateRanges: [{ startDate: START_DATE, endDate: "today" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: { fieldName: "eventName", stringFilter: { value: "file_download" } },
      },
    });
    site.downloads = metric(dl, 0);
    if (!site.downloads) throw new Error(`empty download report for property ${propertyId}`);
  }
  return site;
}

async function main() {
  let previous = {};
  try {
    previous = JSON.parse(await readFile(OUT_URL, "utf8"));
  } catch {}
  const token = await getAccessToken();
  const out = {};
  for (const [site, id] of Object.entries(PROPERTIES)) {
    try {
      out[site] = await fetchSite(token, id, site === "filedownloader");
    } catch (err) {
      console.warn(`WARN keeping previous stats for ${site}: ${err.message}`);
      if (previous[site]) out[site] = previous[site];
    }
    /* The trend falls back on its own: a bad series report must not discard totals
       that fetched fine, and a stale chart beats an empty one. */
    if (out[site]) {
      try {
        out[site].series = await fetchSeries(token, id, site);
      } catch (err) {
        console.warn(`WARN keeping previous series for ${site}: ${err.message}`);
        if (previous[site]?.series) out[site].series = previous[site].series;
      }
    }
  }
  for (const site of Object.keys(PROPERTIES)) {
    if (!out[site]) throw new Error(`no data for ${site} and no previous value to fall back on`);
  }
  /* GitHub is a side signal: a failure here must never drop the GA4 numbers. */
  try {
    out.switchboard = await fetchSwitchboard(previous.switchboard);
  } catch (err) {
    console.warn(`WARN keeping previous switchboard stats: ${err.message}`);
    if (previous.switchboard) out.switchboard = previous.switchboard;
  }
  const sitesUnchanged = Object.keys(out).every(
    (site) => JSON.stringify(out[site]) === JSON.stringify(previous[site])
  );
  const updated =
    sitesUnchanged && previous.updated ? previous.updated : new Date().toISOString().slice(0, 10);
  const final = { updated, ...out };
  await mkdir(new URL("./", OUT_URL), { recursive: true });
  await writeFile(OUT_URL, JSON.stringify(final, null, 2) + "\n");
  console.log("wrote", JSON.stringify(final));
}

if (process.argv[2] === "--selftest") {
  const { strict: assert } = await import("node:assert");
  const day = (t, c, u) => ({ timestamp: `${t}T00:00:00Z`, count: c, uniques: u });
  // fresh window overwrites the days it covers, older history survives untouched
  assert.deepEqual(
    mergeDays({ "2026-08-01": [5, 5], "2026-08-25": [13, 12] }, [day("2026-08-25", 14, 13), day("2026-08-26", 11, 8)]),
    { "2026-08-01": [5, 5], "2026-08-25": [14, 13], "2026-08-26": [11, 8] }
  );
  // re-running the same window must not inflate the totals
  const once = mergeDays(undefined, [day("2026-08-25", 13, 12)]);
  assert.deepEqual(mergeDays(once, [day("2026-08-25", 13, 12)]), once);
  assert.equal(Object.keys(mergeDays(Object.fromEntries(
    Array.from({ length: 400 }, (_, i) => [`2025-01-${i}`, [1, 1]])
  ), [])).length, CLONE_HISTORY_DAYS);
  console.log("selftest ok");
  process.exit(0);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
