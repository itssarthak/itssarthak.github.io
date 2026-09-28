// Builds v2/answers.json for the Ask box: reads docs/answer-bank.csv and embeds every
// phrasing once, so the browser only ever embeds the visitor's question.
// Re-run only when the answer bank changes:
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
  const answers = parse(await readFile(SRC, "utf8"));
  const embed = await pipeline("feature-extraction", MODEL, { dtype: DTYPE });
  const idx = [], vecs = [];
  for (const [i, x] of answers.entries()) {
    for (const text of [x.q, ...x.phrasings]) {
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
  for (const x of answers) for (const w of [x.q, ...x.phrasings, x.a].join(" ").toLowerCase().match(/[a-z][a-z0-9'-]+/g) || []) counts[w] = (counts[w] || 0) + 1;
  const vocab = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).join(" ");
  // Common English words (google-10000-english, Josh Kaufman) the spelling fix leaves alone, so "married" never becomes "carried".
  const common = (await readFile(COMMON, "utf8")).split(/\s+/).filter((w) => w.length >= 5 && !(w in counts)).join(" ");
  await writeFile(OUT, JSON.stringify({ model: MODEL, dtype: DTYPE, dim, answers: answers.map(({ q, era, a }) => ({ q, era, a })), idx, vecs: b64, vocab, common }));
  console.log(`wrote ${answers.length} answers, ${idx.length} vectors × ${dim} dims`);
}

if (process.argv[1] === new URL(import.meta.url).pathname) main();
