/**
 * Supabase client (publishable/anon key only — never the secret/service-role
 * key in this code path). Two responsibilities:
 *   - readCorpus(): text-only corpus rows (embeddings live in index.json, NOT here)
 *   - writeEvent(): anonymous analytics (urgency, lang) — NEVER user input/PII
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, live } from "./env";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!live.supabase()) return null;
  if (!client) {
    client = createClient(env.supabase.url!, env.supabase.key!, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export interface CorpusRow {
  id: string;
  source_name: string;
  source_url: string;
  topic: string;
  chunk_text: string;
}

/** Text-only read of the corpus table (no embedding column exists). */
export async function readCorpus(): Promise<CorpusRow[]> {
  const db = getClient();
  if (!db) return [];
  const { data, error } = await db
    .from("corpus")
    .select("id, source_name, source_url, topic, chunk_text");
  if (error) {
    console.error("readCorpus failed:", error.message);
    return [];
  }
  return (data as CorpusRow[]) ?? [];
}

export interface EventRow {
  /** kept deliberately tiny + non-identifying */
  kind: "express" | "interpret" | "tts" | "stt" | "ocr" | "culture";
  urgency?: string;
  lang?: string;
  red_flag?: boolean;
}

/** Anonymous event write. Best-effort: never throws into the request path. */
export async function writeEvent(event: EventRow): Promise<void> {
  const db = getClient();
  if (!db) return;
  const { error } = await db.from("events").insert({
    kind: event.kind,
    urgency: event.urgency ?? null,
    lang: event.lang ?? null,
    red_flag: event.red_flag ?? null,
  });
  if (error) console.error("writeEvent failed:", error.message);
}

/** Health probe: confirms we can reach the corpus table. */
export async function dbHealth(): Promise<{ ok: boolean; configured: boolean; rows: number; note?: string }> {
  if (!live.supabase()) return { ok: false, configured: false, rows: 0, note: "no SUPABASE_URL/key" };
  const db = getClient()!;
  const { count, error } = await db
    .from("corpus")
    .select("id", { count: "exact", head: true });
  if (error) return { ok: false, configured: true, rows: 0, note: error.message };
  return { ok: true, configured: true, rows: count ?? 0 };
}
