/**
 * Server-side WAV helpers (Node Buffer).
 *
 * Gemini TTS returns RAW PCM (signed 16-bit little-endian, mono, 24kHz) with a
 * mimeType like `audio/L16;codec=pcm;rate=24000`. A browser `<audio>` element
 * cannot play raw PCM — it must be wrapped in a WAV (RIFF) container first.
 */

/** Parse the PCM sample rate from a Gemini `audio/L16;...;rate=NNNNN` mimeType. */
export function parsePcmRate(mimeType: string, fallback = 24000): number {
  const match = /rate=(\d+)/i.exec(mimeType ?? "");
  const rate = match ? Number(match[1]) : NaN;
  return Number.isFinite(rate) && rate > 0 ? rate : fallback;
}

/** Wrap raw little-endian PCM bytes in a 44-byte WAV header. */
export function pcmBufferToWav(
  pcm: Buffer,
  sampleRate = 24000,
  channels = 1,
  bitsPerSample = 16,
): Buffer {
  const blockAlign = (channels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataLen = pcm.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + dataLen, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16); // PCM fmt chunk size
  header.writeUInt16LE(1, 20); // audio format = PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(dataLen, 40);

  return Buffer.concat([header, pcm]);
}

/** Convenience: base64 PCM in → base64 WAV out. */
export function pcmToWav(
  base64Pcm: string,
  sampleRate = 24000,
  channels = 1,
  bitsPerSample = 16,
): string {
  const pcm = Buffer.from(base64Pcm, "base64");
  return pcmBufferToWav(pcm, sampleRate, channels, bitsPerSample).toString("base64");
}
