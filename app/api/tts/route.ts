import { NextResponse } from "next/server";
import { geminiTts } from "@/lib/gemini";
import { parsePcmRate, pcmToWav } from "@/lib/wav";

export const runtime = "nodejs";

/**
 * Text-to-speech (the demo moment). Synthesizes the English script with Gemini
 * TTS, then wraps the raw PCM it returns in a WAV container so the browser can
 * play it directly. Returns base64 WAV (not a stream) for serverless
 * reliability. On a mocked/failed call we return 503 + `{mocked:true}` so the
 * client can fall back to the pre-recorded demo clip.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json().catch(() => null)) as
    | { text?: unknown; voice?: unknown }
    | null;

  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const voice = typeof body?.voice === "string" ? body.voice : undefined;

  if (!text) {
    return NextResponse.json({ error: "No text provided." }, { status: 400 });
  }

  const tts = await geminiTts({ text, voice });

  if (tts.mocked || !tts.audioBase64) {
    return NextResponse.json(
      { mocked: true, error: "TTS unavailable — use the demo clip." },
      { status: 503 },
    );
  }

  const rate = parsePcmRate(tts.mimeType);
  const audioBase64Wav = pcmToWav(tts.audioBase64, rate);

  return NextResponse.json(
    { audioBase64Wav, mimeType: "audio/wav" },
    { status: 200 },
  );
}
