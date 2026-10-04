// Builds answers.json for the Ask box: reads docs/answer-bank.csv and embeds every
// phrasing once, so the browser only ever embeds the visitor's question. Also adds the résumé,
// one entry per section (src: 'resume.html'), for the chat agent's search tool.
// Re-run when the answer bank or the résumé changes:
//   npm i --no-save --no-package-lock @huggingface/transformers@4.3.0
//   node scripts/build-answer-index.mjs
// MODEL and DTYPE must match app.js, or the vectors won't be comparable.
import { readFile, writeFile } from "node:fs/promises";
import { pipeline } from "@huggingface/transformers";

const MODEL = "Xenova/all-MiniLM-L6-v2";
const DTYPE = "q8";
// Visitors ask about "Sarthak"/"he"; the bank is written as "you". Map both to "you" so the
// name itself doesn't dominate the match. app.js has the same function; keep them identical.
export const norm = (q) => q.toLowerCase().replace(/\bsarthak('s)?\b/g, "you").replace(/\b(he|him|he's)\b/g, "you").replace(/\bhis\b/g, "your");

const SRC = new URL("../docs/answer-bank.csv", import.meta.url);
const OUT = new URL("../answers.json", import.meta.url);
const COMMON = new URL("./common-words.txt", import.meta.url);
const RESUME = new URL("../resume.html", import.meta.url);

// Résumé → one entry per <h2>/<h3> section, titled by its headings: { q: title, a: text, src }.
export function pageSections(html, src, name) {
  const text = (h) => h.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
  const main = (html.match(/<main[\s\S]*?<\/main>/) || [html])[0].replace(/<(script|style)[\s\S]*?<\/\1>/g, "")
    .replace(/(<div class="when">[\s\S]*?<\/div>)\s*(<h3[\s\S]*?<\/h3>)/g, "$2 $1");  // a role's dates sit above its title: keep them in its section
  const out = []; let h2 = "";
  for (const part of main.split(/(?=<h[23][\s>])/).slice(1)) {
    const [, lvl, head] = part.match(/^<h([23])[^>]*>([\s\S]*?)<\/h\1>/) || [];
    if (!lvl) continue;
    if (lvl === "2") h2 = text(head);
    const body = text(part.slice(part.indexOf("</h" + lvl + ">") + 5));
    if (body.length > 20) out.push({ q: [name, h2, lvl === "3" ? text(head) : ""].filter(Boolean).join(" · "), era: "all", a: body, src, phrasings: [] });
  }
  // Every role with its dates in one entry, for "how long" and "when" questions that span roles.
  const M = "jan feb mar apr may jun jul aug sep oct nov dec".split(" ");
  const span = (w) => { // "Jul 2025 – Feb 2026" → "7 months": small models get date arithmetic wrong, so do it here
    const d = [...w.toLowerCase().matchAll(/([a-z]{3})[a-z]* (\d{4})/g)].map(([, m, y]) => +y * 12 + M.indexOf(m));
    if (d.length !== 2 || d.includes(-1)) return "";
    const n = d[1] - d[0], y = Math.floor(n / 12), m = n % 12;
    return " (" + [y && y + (y > 1 ? " years" : " year"), m && m + (m > 1 ? " months" : " month")].filter(Boolean).join(" ") + ")";
  };
  const roles = [...html.matchAll(/<div class="when">([\s\S]*?)<\/div>\s*<h3[^>]*>([\s\S]*?)<\/h3>/g)].map(([, when, head]) => text(head) + ": " + text(when) + span(text(when)));
  if (roles.length) out.push({ q: name + " · Career timeline (dates of every role, most recent first)", era: "all", a: roles.join(". ") + ".", src,
    phrasings: ["how long did you work there", "how long were you at each company", "tenure at each job", "duration of each role", "employment dates", "when did you join", "when did you leave", "work timeline", "career dates"] });
  return out;
}

// Minimal RFC 4180 reader: quoted fields, doubled quotes, newlines inside quotes.
export function readCsv(text) {
  const rows = [[]];
  let f = "", q = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { f += '"'; i++; }
      else if (c === '"') q = false;
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ",") { rows.at(-1).push(f); f = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      rows.at(-1).push(f); f = ""; rows.push([]);
    } else f += c;
  }
  rows.at(-1).push(f);
  return rows.filter((r) => r.some((x) => x.trim()));
}

// Columns: question, version (v1–v6 or all), other ways to ask (| separated), answer.
// Rows whose answer is empty or starts with ❓ are skipped.
export function parse(csv) {
  return readCsv(csv).slice(1)
    .map(([q = "", era = "all", ways = "", a = ""]) => ({
      q: q.trim(), era: era.trim().toLowerCase() || "all", a: a.trim(),
      phrasings: ways.split("|").map((x) => x.trim()).filter(Boolean),
    }))
    .filter((x) => x.q && x.a && !x.a.startsWith("❓"));
}

async function main() {
  const answers = [...parse(await readFile(SRC, "utf8")), ...pageSections(await readFile(RESUME, "utf8"), "resume.html", "Résumé")];
  const embed = await pipeline("feature-extraction", MODEL, { dtype: DTYPE });
  const idx = [], vecs = [];
  for (const [i, x] of answers.entries()) {
    for (const text of x.src ? [x.q, x.q + ". " + x.a, ...x.phrasings] : [x.q, ...x.phrasings]) { // a page section is found by its title, its content or its phrasings
      const out = await embed(norm(text), { pooling: "mean", normalize: true });
      idx.push(i);
      // ponytail: int8 quantisation keeps the file ~6x smaller; cosine ranking barely moves
      vecs.push(...Array.from(out.data, (v) => Math.max(-127, Math.min(127, Math.round(v * 127)))));
    }
  }
  const dim = vecs.length / idx.length;
  const b64 = Buffer.from(Int8Array.from(vecs).buffer).toString("base64");
  // Vocabulary for the Ask box's spelling fix: every word in the bank with its count, most frequent first.
  const counts = {};
  for (const x of answers) if (!x.src) for (const w of [x.q, ...x.phrasings, x.a].join(" ").toLowerCase().match(/[a-z][a-z0-9'-]+/g) || []) counts[w] = (counts[w] || 0) + 1;
  const vocab = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).join(" ");
  // Common English words (google-10000-english, Josh Kaufman) the spelling fix leaves alone, so "married" never becomes "carried".
  const common = (await readFile(COMMON, "utf8")).split(/\s+/).filter((w) => w.length >= 5 && !(w in counts)).join(" ");
  await writeFile(OUT, JSON.stringify({ model: MODEL, dtype: DTYPE, dim, answers: answers.map(({ q, era, a, src }) => (src ? { q, era, a, src } : { q, era, a })), idx, vecs: b64, vocab, common }));
  console.log(`wrote ${answers.length} answers, ${idx.length} vectors × ${dim} dims`);
}

if (process.argv[1] === new URL(import.meta.url).pathname) main();
