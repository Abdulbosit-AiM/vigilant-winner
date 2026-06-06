/**
 * One-off: pre-record the demo Express English-script TTS as a static WAV so the
 * "play to midwife" moment never depends on a live call (PRD §11.8).
 *
 * Calls live Gemini TTS once, wraps the PCM in WAV, writes:
 *   - data/demo/express-script.wav  (canonical source of truth)
 *   - data/demo/express-script.txt  (the script text)
 *   - public/demo/express-script.wav (browser-served fallback)
 *
 * Run:  npx tsx scripts/gen-demo-audio.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// Load .env.local into process.env BEFORE importing anything that reads env.
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

const DEMO_SCRIPT =
  "Hello. I am 34 weeks pregnant. Since yesterday, I have noticed my baby is " +
  "moving less than usual. I would like to be checked today. Please can you " +
  "tell me where I should go.";

async function main() {
  loadEnvLocal();
  const { geminiTts } = await import("../lib/gemini");
  const { parsePcmRate, pcmBufferToWav } = await import("../lib/wav");

  const tts = await geminiTts({ text: DEMO_SCRIPT });
  if (tts.mocked || !tts.audioBase64) {
    throw new Error("Gemini TTS returned a mocked/empty result — cannot record demo audio.");
  }

  const rate = parsePcmRate(tts.mimeType);
  const wav = pcmBufferToWav(Buffer.from(tts.audioBase64, "base64"), rate);

  mkdirSync(path.resolve("data/demo"), { recursive: true });
  mkdirSync(path.resolve("public/demo"), { recursive: true });
  writeFileSync(path.resolve("data/demo/express-script.wav"), wav);
  writeFileSync(path.resolve("public/demo/express-script.wav"), wav);
  writeFileSync(path.resolve("data/demo/express-script.txt"), DEMO_SCRIPT + "\n");

  console.log(`Wrote demo WAV: ${wav.length} bytes (rate=${rate})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
