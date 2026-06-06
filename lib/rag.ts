/**
 * In-memory RAG retrieval. The vector index lives at /data/corpus/index.json
 * (built later in M6). That file MAY NOT EXIST yet — every path here is
 * non-throwing: a missing index degrades to the Supabase corpus text, and a
 * missing corpus degrades to an empty context. The route handles empty context
 * via the rule-4 fallback citation.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { geminiEmbed } from "./gemini";
import { readCorpus } from "./db";

export interface RetrievedChunk {
  source_name: string;
  text: string;
}

interface IndexEntry {
  source_name?: string;
  chunk_text?: string;
  text?: string;
  embedding?: number[];
  vector?: number[];
}

const INDEX_PATH = path.join(process.cwd(), "data", "corpus", "index.json");

function cosine(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

async function loadIndex(): Promise<IndexEntry[] | null> {
  try {
    const raw = await fs.readFile(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as IndexEntry[]) : null;
  } catch {
    return null;
  }
}

function normalise(entry: IndexEntry): RetrievedChunk | null {
  const text = entry.text ?? entry.chunk_text ?? "";
  const source_name = entry.source_name ?? "";
  if (!text || !source_name) return null;
  return { source_name, text };
}

/**
 * Retrieve top-K grounding chunks for a query. Never throws.
 */
export async function retrieveContext(query: string, topK = 4): Promise<RetrievedChunk[]> {
  try {
    const index = await loadIndex();

    if (index && index.length > 0) {
      const withVectors = index.filter((e) => (e.embedding ?? e.vector)?.length);
      if (withVectors.length > 0) {
        const { vector } = await geminiEmbed(query);
        const ranked = withVectors
          .map((e) => ({
            entry: e,
            score: cosine(vector, (e.embedding ?? e.vector) as number[]),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, topK)
          .map((r) => normalise(r.entry))
          .filter((c): c is RetrievedChunk => c !== null);
        if (ranked.length > 0) return ranked;
      }
      const flat = index
        .map(normalise)
        .filter((c): c is RetrievedChunk => c !== null)
        .slice(0, topK);
      if (flat.length > 0) return flat;
    }

    // Fallback: readable corpus text from Supabase (no vectors).
    const rows = await readCorpus();
    return rows
      .slice(0, topK)
      .map((r) => ({ source_name: r.source_name, text: r.chunk_text }))
      .filter((c) => c.text && c.source_name);
  } catch {
    return [];
  }
}
