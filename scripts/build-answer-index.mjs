// Builds the Ask box's two search indexes, so the browser only ever embeds the visitor's text:
// - answers.json from docs/answer-bank.csv: the direct-answer fallback (and the terminal), matched question to question.
// - knowledge.json from docs/knowledge.md: what the chat agent's search tool reads, one entry per "## " section.
// Re-run when either file changes:
//   npm i --no-save --no-package-lock @huggingface/transformers@4.3.0
//   node scripts/build-answer-index.mjs
// MODEL/DTYPE and KB_MODEL/KB_DTYPE must match app.js, or the vectors won't be comparable.
import { readFile, writeFile } from "node:fs/promises";
import { pipeline } from "@huggingface/transformers";

const MODEL = "Xenova/all-MiniLM-L6-v2";
const DTYPE = "q8";
// The agent searches passages, not questions, so it gets a retrieval model; queries carry KB_QUERY in front (app.js adds it).
const KB_MODEL = "Xenova/bge-small-en-v1.5";
const KB_DTYPE = "q8";
// Visitors ask about "Sarthak"/"he"; the bank is written as "you". Map both to "you" so the
// name itself doesn't dominate the match. app.js has the same function; keep them identical.
export const norm = (q) => q.toLowerCase().replace(/\bsarthak('s)?\b/g, "you").replace(/\b(he|him|he's)\b/g, "you").replace(/\bhis\b/g, "your");

const SRC = new URL("../docs/answer-bank.csv", import.meta.url);
const OUT = new URL("../answers.json", import.meta.url);
const COMMON = new URL("./common-words.txt", import.meta.url);
const KB_SRC = new URL("../docs/knowledge.md", import.meta.url);
const KB_OUT = new URL("../knowledge.json", import.meta.url);

// knowledge.md → [{ t: heading, a: text, ask: [other ways to ask] }], one per "## " section.
// HTML comments are notes for the editor; "> " lines are search phrasings, kept out of the text.
export function sections(md) {
  return md.replace(/<!--[\s\S]*?-->/g, "").split(/^## /m).slice(1).map((s) => {
    const [t, ...lines] = s.split("\n");
    const ask = lines.filter((l) => l.startsWith("> ")).flatMap((l) => l.slice(2).split(",")).map((x) => x.trim()).filter(Boolean);
    return { t: t.trim(), a: lines.filter((l) => !l.startsWith("> ")).join("\n").trim().replace(/\s*\n\s*/g, " "), ask };
  }).filter((x) => x.t && x.a);
}
// ponytail: int8 quantisation keeps the files ~6x smaller; cosine ranking barely moves
const int8 = (data) => Array.from(data, (v) => Math.max(-127, Math.min(127, Math.round(v * 127))));

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
      vecs.push(...int8(out.data));
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

  const kb = sections(await readFile(KB_SRC, "utf8"));
  const kbEmbed = await pipeline("feature-extraction", KB_MODEL, { dtype: KB_DTYPE });
  const kv = [], kidx = []; // a section is found by its full text, its heading, or any of its "> " phrasings; the best match counts
  for (const [i, x] of kb.entries()) for (const text of [x.t + ". " + x.a, x.t, ...x.ask]) {
    kv.push(...int8((await kbEmbed(text, { pooling: "cls", normalize: true })).data)); kidx.push(i); // BGE uses the CLS token
  }
  await writeFile(KB_OUT, JSON.stringify({ model: KB_MODEL, dtype: KB_DTYPE, dim: kv.length / kidx.length, kb: kb.map(({ t, a }) => ({ t, a })), idx: kidx, vecs: Buffer.from(Int8Array.from(kv).buffer).toString("base64") }));
  console.log(`wrote ${kb.length} knowledge sections`);
}

if (process.argv[1] === new URL(import.meta.url).pathname) main();
