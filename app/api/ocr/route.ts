import { NextResponse } from "next/server";
import { geminiOcr } from "@/lib/gemini";
import { assessOcrText } from "@/lib/ocr";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

/** ~8MB of image after base64 decoding (base64 inflates by ~4/3). */
const MAX_IMAGE_BASE64_CHARS = 11 * 1024 * 1024;

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

/**
 * OCR (bonus, M5). Accepts an inline letter photo as base64, extracts text via
 * Gemini vision, and returns it for USER CONFIRMATION before Interpret runs —
 * this route never calls the LLM interpretation itself (PRD §11.7).
 *
 * The image is processed in memory only: never logged, never persisted, never
 * written to Supabase. Low/empty/mocked extraction → 422/503 so the UI shows
 * "couldn't read" with Retake / Type-instead actions.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const rl = rateLimit(getClientIp(req));
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again.", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { imageBase64?: unknown; mimeType?: unknown }
    | null;

  const imageBase64 = typeof body?.imageBase64 === "string" ? body.imageBase64 : "";
  const mimeType = typeof body?.mimeType === "string" ? body.mimeType : "";

  if (!imageBase64) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(mimeType)) {
    return NextResponse.json(
      { error: "Unsupported image type. Please use a JPEG or PNG photo." },
      { status: 400 },
    );
  }
  if (imageBase64.length > MAX_IMAGE_BASE64_CHARS) {
    return NextResponse.json(
      { error: "Image too large. Please retake the photo at a lower resolution." },
      { status: 413 },
    );
  }

  const result = await geminiOcr({ imageBase64, mimeType });

  if (result.mocked) {
    // Quota/offline — not the user's fault; UI offers Retake / Type instead.
    return NextResponse.json(
      { error: "Couldn't read the photo right now — please type or paste the letter instead.", mocked: true },
      { status: 503 },
    );
  }

  const assessed = assessOcrText(result.text);
  if (!assessed.ok) {
    return NextResponse.json(
      { error: "Couldn't read enough text from this photo. Try a clearer photo, or type/paste the letter instead.", unreadable: true },
      { status: 422 },
    );
  }

  // Extracted text only — the client shows it for confirmation before Interpret.
  return NextResponse.json({ text: assessed.text }, { status: 200 });
}
