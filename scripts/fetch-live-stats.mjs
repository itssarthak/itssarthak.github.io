#!/usr/bin/env node
/* Fetches all-time GA4 stats for live projects and writes assets/data/live-stats.json.
   Auth: service-account JSON from $GA4_SA_KEY (raw JSON) or $GA4_SA_KEY_FILE (path). */
import { createSign } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const PROPERTIES = {
  askmyastro: "541034254",
  filedownloader: "214739151",
};
const START_DATE = "2016-01-01"; // GA4 Data API rejects anything before 2015-08-14
const OUT_URL = new URL("../assets/data/live-stats.json", import.meta.url);

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

async function fetchSite(token, propertyId, withDownloads) {
  const totals = await runReport(token, propertyId, {
    dateRanges: [{ startDate: START_DATE, endDate: "today" }],
    metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
  });
  const site = { users: metric(totals, 0), pageviews: metric(totals, 1) };
  if (withDownloads) {
    const dl = await runReport(token, propertyId, {
      dateRanges: [{ startDate: START_DATE, endDate: "today" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: { fieldName: "eventName", stringFilter: { value: "file_download" } },
      },
    });
    site.downloads = metric(dl, 0);
  }
  return site;
}

async function main() {
  let previous = {};
  try {
    previous = JSON.parse(await readFile(OUT_URL, "utf8"));
  } catch {}
  const token = await getAccessToken();
  const out = { updated: new Date().toISOString().slice(0, 10) };
  let fetched = 0;
  for (const [site, id] of Object.entries(PROPERTIES)) {
    try {
      out[site] = await fetchSite(token, id, site === "filedownloader");
      fetched++;
    } catch (err) {
      console.warn(`WARN keeping previous stats for ${site}: ${err.message}`);
      if (previous[site]) out[site] = previous[site];
    }
  }
  if (fetched === 0) throw new Error("no properties fetched");
  await mkdir(new URL("./", OUT_URL), { recursive: true });
  await writeFile(OUT_URL, JSON.stringify(out, null, 2) + "\n");
  console.log("wrote", JSON.stringify(out));
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
