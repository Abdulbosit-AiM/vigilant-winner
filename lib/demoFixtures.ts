/**
 * Demo-safe fixtures (PRD §11.8). Saved, fully-written example outputs served
 * when DEMO_SAFE_MODE is on OR a live call fails, so the demo can never fall to
 * a bare "couldn't explain" message. Each fixture mirrors its response schema
 * (§11.2 / §11.3 / §11.5) and is validated against Zod at serve time — a fixture
 * is never trusted as raw text either. The red-flag gate is ALWAYS real and
 * never served from a fixture.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const DEMO_DIR = path.join(process.cwd(), "data", "demo");

async function loadFixture(name: "express" | "interpret" | "redflag"): Promise<unknown> {
  try {
    const raw = await fs.readFile(path.join(DEMO_DIR, `${name}.json`), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const loadExpressFixture = () => loadFixture("express");
export const loadInterpretFixture = () => loadFixture("interpret");
export const loadRedflagFixture = () => loadFixture("redflag");
