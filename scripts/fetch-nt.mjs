/** Descarga el Nuevo Testamento (RV1960 + NTV) desde bolls.life y lo guarda
 * como JSON estático en public/bible/{version}/{key}.json
 *
 * Uso: node scripts/fetch-nt.mjs
 *
 * Mantener la lista en sync con `lib/seeds/nt-books.ts` (key, bookId, chapters).
 * RV1960 © Sociedades Bíblicas Unidas. NTV © Tyndale House Foundation.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// [key, bookId, chapters] — mismo orden canónico que lib/seeds/nt-books.ts
const BOOKS = [
  ["mateo", 40, 28],
  ["marcos", 41, 16],
  ["lucas", 42, 24],
  ["juan", 43, 21],
  ["hechos", 44, 28],
  ["romanos", 45, 16],
  ["1-corintios", 46, 16],
  ["2-corintios", 47, 13],
  ["galatas", 48, 6],
  ["efesios", 49, 6],
  ["filipenses", 50, 4],
  ["colosenses", 51, 4],
  ["1-tesalonicenses", 52, 5],
  ["2-tesalonicenses", 53, 3],
  ["1-timoteo", 54, 6],
  ["2-timoteo", 55, 4],
  ["tito", 56, 3],
  ["filemon", 57, 1],
  ["hebreos", 58, 13],
  ["santiago", 59, 5],
  ["1-pedro", 60, 5],
  ["2-pedro", 61, 3],
  ["1-juan", 62, 5],
  ["2-juan", 63, 1],
  ["3-juan", 64, 1],
  ["judas", 65, 1],
  ["apocalipsis", 66, 22],
];

const VERSIONS = [
  ["rvr1960", "RV1960"],
  ["ntv", "NTV"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cleanText(raw) {
  return String(raw)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchChapter(translation, bookId, chapter) {
  const url = `https://bolls.life/get-text/${translation}/${bookId}/${chapter}/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Sin datos en ${url}`);
  }
  return data.map((v) => ({ n: v.verse, t: cleanText(v.text) }));
}

async function main() {
  let total = 0;
  for (const [dir, translation] of VERSIONS) {
    for (const [key, bookId, chapters] of BOOKS) {
      const book = {};
      for (let ch = 1; ch <= chapters; ch++) {
        book[String(ch)] = await fetchChapter(translation, bookId, ch);
        total += book[String(ch)].length;
        await sleep(120); // amable con la API
      }
      const out = join(ROOT, "public", "bible", dir, `${key}.json`);
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, JSON.stringify(book, null, 1) + "\n", "utf8");
      console.log(`✓ ${dir}/${key}.json (${chapters} caps)`);
    }
  }
  console.log(`\nListo: ${total} versículos descargados.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
