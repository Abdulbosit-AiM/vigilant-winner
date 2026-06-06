/**
 * Build-time RAG corpus indexer (BUILD-PLAN M6.2 / PRD §11). Scrapes the public
 * NHS / Tommy's pages listed in docs/RAG-CORPUS.md (no API key needed), chunks
 * to ~400 tokens with ~50-token overlap, embeds each chunk via Gemini, and
 * writes /data/corpus/index.json as { chunk_text, vector, source_name,
 * source_url }[].
 *
 * Embeddings live ONLY in index.json — never written to Supabase. The chunk TEXT
 * (no vectors) is optionally upserted into the Supabase `corpus` table as a
 * readable backup.
 *
 * Quota-aware: if embeddings hit the wall (a mocked result), we stop embedding,
 * keep the remaining chunks as text-only entries (lib/rag.ts tolerates a missing
 * vector), and report how many chunks were embedded.
 *
 * Run: npm run index:corpus   (needs outbound internet)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  const file = path.resolve(process.cwd(), ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

interface Source {
  source_name: string;
  source_url: string;
  topic: string;
}

// The 12 curated sources from docs/RAG-CORPUS.md.
const SOURCES: Source[] = [
  {
    // Original /im-pregnant/your-babys-movements 404s after the 2026 site
    // migration; current canonical page (reviewed Jan 2026).
    source_name: "Tommy's — Your baby's movements",
    source_url:
      "https://www.tommys.org/pregnancy-information/pregnancy-symptom-checker/baby-fetal-movements",
    topic: "reduced fetal movements",
  },
  {
    source_name: "NHS — Pre-eclampsia",
    source_url: "https://www.nhs.uk/conditions/pre-eclampsia/",
    topic: "pre-eclampsia symptoms",
  },
  {
    source_name: "Tommy's — Pregnancy warning signs",
    source_url:
      "https://www.tommys.org/pregnancy-information/pregnancy-complications/pregnancy-warning-signs",
    topic: "pregnancy warning signs",
  },
  {
    source_name: "NHS — Your antenatal appointments",
    source_url: "https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-appointments/",
    topic: "antenatal care overview",
  },
  {
    source_name: "NHS — Your 12-week scan",
    source_url: "https://www.nhs.uk/pregnancy/your-pregnancy-care/12-week-scan/",
    topic: "12-week scan",
  },
  {
    source_name: "NHS — Your mid-pregnancy (20-week) scan",
    source_url: "https://www.nhs.uk/pregnancy/your-pregnancy-care/20-week-scan/",
    topic: "20-week anomaly scan",
  },
  {
    // NHS renamed the slug to .../screening-for-downs-edwards-pataus-syndrome/
    // (singular, no "and") in the 2026 migration.
    source_name: "NHS — Screening for Down's, Edwards' and Patau's syndromes",
    source_url:
      "https://www.nhs.uk/pregnancy/your-pregnancy-care/screening-for-downs-edwards-pataus-syndrome/",
    topic: "screening results",
  },
  {
    source_name: "NHS — Blood tests in pregnancy",
    source_url: "https://www.nhs.uk/pregnancy/your-pregnancy-care/blood-tests/",
    topic: "blood tests",
  },
  {
    source_name: "NHS — Gestational diabetes",
    source_url: "https://www.nhs.uk/conditions/gestational-diabetes/",
    topic: "gestational diabetes",
  },
  {
    source_name: "NHS — Signs of labour",
    source_url: "https://www.nhs.uk/pregnancy/labour-and-birth/signs-of-labour/",
    topic: "signs of labour",
  },
  {
    source_name: "NHS — Your postnatal care",
    source_url: "https://www.nhs.uk/conditions/baby/support-and-services/postnatal-care/",
    topic: "postnatal care",
  },
  {
    source_name: "NHS Start for Life — How to get antenatal care",
    source_url: "https://www.nhs.uk/start-for-life/pregnancy/getting-antenatal-care/",
    topic: "self-referral to a midwife",
  },
];

// ~400 tokens ≈ 1600 chars; ~50-token overlap ≈ 200 chars.
const CHUNK_CHARS = 1600;
const OVERLAP_CHARS = 200;
const MAX_CHUNKS_PER_SOURCE = 8;

/** Strip HTML to readable plain text (no parser dependency). */
function htmlToText(html: string): string {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ");
  // Keep only the <main> region when present (drops nav/header/footer noise).
  const main = text.match(/<main[\s\S]*?<\/main>/i);
  if (main) text = main[0];
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length && chunks.length < MAX_CHUNKS_PER_SOURCE) {
    const end = Math.min(start + CHUNK_CHARS, text.length);
    chunks.push(text.slice(start, end).trim());
    if (end >= text.length) break;
    start = end - OVERLAP_CHARS;
  }
  return chunks.filter((c) => c.length > 80);
}

interface IndexEntry {
  chunk_text: string;
  vector?: number[];
  source_name: string;
  source_url: string;
}

async function main() {
  loadEnvLocal();
  const { geminiEmbed } = await import("../lib/gemini");

  const entries: IndexEntry[] = [];
  let embedded = 0;
  let textOnly = 0;
  let embeddingsExhausted = false;
  const skipped: string[] = [];

  for (const src of SOURCES) {
    let html: string;
    try {
      const res = await fetch(src.source_url, {
        headers: { "User-Agent": "Mozilla/5.0 (Maternify corpus indexer)" },
      });
      if (!res.ok) {
        skipped.push(`${src.source_url} (HTTP ${res.status})`);
        continue;
      }
      html = await res.text();
    } catch (err) {
      skipped.push(`${src.source_url} (${err instanceof Error ? err.message : "fetch failed"})`);
      continue;
    }

    const text = htmlToText(html);
    const chunks = chunkText(text);
    if (chunks.length === 0) {
      skipped.push(`${src.source_url} (no extractable text)`);
      continue;
    }

    for (const chunk of chunks) {
      const entry: IndexEntry = {
        chunk_text: chunk,
        source_name: src.source_name,
        source_url: src.source_url,
      };
      if (!embeddingsExhausted) {
        const { vector, mocked } = await geminiEmbed(chunk);
        if (mocked) {
          // Quota wall (or no key): stop embedding, keep remaining as text-only.
          embeddingsExhausted = true;
          textOnly++;
        } else if (vector.length > 0) {
          entry.vector = vector;
          embedded++;
        } else {
          textOnly++;
        }
      } else {
        textOnly++;
      }
      entries.push(entry);
    }
    console.log(`indexed ${src.source_name}: ${chunks.length} chunks`);
  }

  const outDir = path.resolve("data/corpus");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "index.json"), JSON.stringify(entries, null, 2));

  // Optional readable backup into Supabase corpus table (TEXT only, no vectors).
  let supabaseNote = "skipped (not configured)";
  try {
    const { live, env } = await import("../lib/env");
    if (live.supabase()) {
      const { createClient } = await import("@supabase/supabase-js");
      const db = createClient(env.supabase.url!, env.supabase.key!, {
        auth: { persistSession: false },
      });
      const rows = entries.map((e) => ({
        source_name: e.source_name,
        source_url: e.source_url,
        topic: SOURCES.find((s) => s.source_name === e.source_name)?.topic ?? null,
        chunk_text: e.chunk_text,
      }));
      const { error } = await db.from("corpus").insert(rows);
      supabaseNote = error ? `failed (${error.message})` : `upserted ${rows.length} text rows`;
    }
  } catch (err) {
    supabaseNote = `failed (${err instanceof Error ? err.message : "unknown"})`;
  }

  console.log("\n=== corpus index summary ===");
  console.log(`total chunks written : ${entries.length}`);
  console.log(`embedded (real vector): ${embedded}`);
  console.log(`text-only (no vector) : ${textOnly}`);
  console.log(`embeddings exhausted  : ${embeddingsExhausted}`);
  console.log(`sources skipped       : ${skipped.length}`);
  for (const s of skipped) console.log(`  - ${s}`);
  console.log(`supabase backup       : ${supabaseNote}`);
  console.log(`written to            : ${path.join(outDir, "index.json")}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
