import { describe, expect, it } from "vitest";
import { parsePcmRate, pcmToWav } from "./wav";

/** 4 samples of silence as raw s16le PCM (8 bytes). */
const PCM_BYTES = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]);
const PCM_B64 = PCM_BYTES.toString("base64");

describe("pcmToWav", () => {
  it("writes a valid RIFF/WAVE header", () => {
    const wav = Buffer.from(pcmToWav(PCM_B64, 24000), "base64");
    expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
    expect(wav.toString("ascii", 8, 12)).toBe("WAVE");
    expect(wav.toString("ascii", 12, 16)).toBe("fmt ");
    expect(wav.toString("ascii", 36, 40)).toBe("data");
  });

  it("has byte length = 44 + dataLen", () => {
    const wav = Buffer.from(pcmToWav(PCM_B64, 24000), "base64");
    expect(wav.length).toBe(44 + PCM_BYTES.length);
    expect(wav.readUInt32LE(40)).toBe(PCM_BYTES.length); // data chunk size
    expect(wav.readUInt32LE(4)).toBe(36 + PCM_BYTES.length); // RIFF chunk size
  });

  it("encodes the sample rate and PCM format fields", () => {
    const wav = Buffer.from(pcmToWav(PCM_B64, 24000), "base64");
    expect(wav.readUInt16LE(20)).toBe(1); // audio format = PCM
    expect(wav.readUInt16LE(22)).toBe(1); // channels (mono)
    expect(wav.readUInt32LE(24)).toBe(24000); // sample rate
    expect(wav.readUInt16LE(34)).toBe(16); // bits per sample
    expect(wav.readUInt32LE(28)).toBe(24000 * 1 * 2); // byte rate
    expect(wav.readUInt16LE(32)).toBe(2); // block align
  });

  it("honours a non-default sample rate", () => {
    const wav = Buffer.from(pcmToWav(PCM_B64, 16000), "base64");
    expect(wav.readUInt32LE(24)).toBe(16000);
  });
});

describe("parsePcmRate", () => {
  it("extracts the rate from a Gemini L16 mimeType", () => {
    expect(parsePcmRate("audio/L16;codec=pcm;rate=24000")).toBe(24000);
    expect(parsePcmRate("audio/L16;rate=16000")).toBe(16000);
  });

  it("falls back to 24000 when absent", () => {
    expect(parsePcmRate("audio/wav")).toBe(24000);
    expect(parsePcmRate("")).toBe(24000);
  });
});
