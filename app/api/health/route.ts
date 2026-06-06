import { NextResponse } from "next/server";
import { DEMO_SAFE_MODE, validateEnv } from "@/lib/env";
import { glmHealth } from "@/lib/glm";
import { geminiHealth } from "@/lib/gemini";
import { dbHealth } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const envProblems = validateEnv();

  const [glm, gemini, db] = await Promise.all([
    glmHealth().catch((e) => ({ ok: false, mocked: false, sample: String(e) })),
    geminiHealth().catch((e) => ({ ok: false, mocked: false, bytes: 0, error: String(e) })),
    dbHealth().catch((e) => ({ ok: false, configured: false, rows: 0, note: String(e) })),
  ]);

  const ok = envProblems.length === 0 && glm.ok && gemini.ok;

  return NextResponse.json(
    {
      ok,
      demoSafeMode: DEMO_SAFE_MODE,
      envProblems,
      providers: { glm, gemini, supabase: db },
      ts: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  );
}
