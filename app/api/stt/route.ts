import { NextResponse } from "next/server";
import { geminiTranscribe } from "@/lib/gemini";

export const runtime = "nodejs";

/**
 * Speech-to-text (bonus). Accepts inline audio base64 (the client encodes the
 * recording to WAV before sending). On 429/quota or any failure `geminiTranscribe`
 * returns `mocked:true`; we surface a clear error the UI shows as "couldn't
 * transcribe, type instead". User audio is never logged.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json().catch(() => null)) as
    | { audioBase64?: unknown; mimeType?: unknown }
    | null;

  const audioBase64 = typeof body?.audioBase64 === "string" ? body.audioBase64 : "";
  const mimeType = typeof body?.mimeType === "string" ? body.mimeType : "audio/wav";

  if (!audioBase64) {
    return NextResponse.json({ error: "No audio provided." }, { status: 400 });
  }

  const result = await geminiTranscribe({ audioBase64, mimeType });

  if (result.mocked || !result.text.trim()) {
    return NextResponse.json(
      { error: "Couldn't transcribe — please type instead.", mocked: true },
      { status: 503 },
    );
  }

  return NextResponse.json({ text: result.text.trim() }, { status: 200 });
}
