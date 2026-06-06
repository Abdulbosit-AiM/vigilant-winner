# Maternify — Tech Stack
**Hackathon build · Chosen for speed to ship, not long-term scale**

---

## Stack

| Layer | Hackathon choice | Why |
|-------|-----------------|-----|
| Framework | Next.js 14 (App Router) + TypeScript | Team familiarity; API routes = no separate backend |
| LLM — generation | Claude Sonnet (`claude-sonnet-4-6`) | Best reasoning on ambiguous input; strict prompt compliance |
| LLM — RAG summary | Claude Haiku (`claude-haiku-4-5-20251001`) | Low latency for high-frequency retrieval step |
| Embeddings | `text-embedding-3-small` (OpenAI) | Fast, cheap, sufficient for 12-source corpus |
| Vector store | In-memory (JS array + cosine similarity) | No external DB to provision; corpus fits in memory |
| TTS | OpenAI TTS API (`tts-1`, voice: `onyx` or `nova`) | British-adjacent clarity; simple REST call |
| OCR | Not in scope (hackathon) | Dropped to reduce build risk |
| STT | Not in scope (hackathon) | Dropped: Web Speech API multilingual unreliable |
| Styling | Tailwind CSS | Fast iteration; mobile-first utilities |
| Validation | Zod | Schema enforcement on all LLM outputs |
| Hosting | Vercel | Zero-config Next.js deploy |
| Rate limiting | `@upstash/ratelimit` or simple in-memory counter | Prevents abuse; required before going live |

---

## API Routes

```
POST /api/express   → urgency gate → RAG → Claude Sonnet → TTS reference
POST /api/interpret → doc type detection → RAG → Claude Haiku → Sonnet
POST /api/tts       → OpenAI TTS → stream audio response
```

---

## Environment Variables

```bash
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

No database. No auth. No other secrets.

---

## Latency Budget

| Path | Budget | How to achieve |
|------|--------|---------------|
| Red-flag detection | < 500ms | Synchronous string match, no API call |
| Express (non-urgent) | < 8s | Haiku for RAG summary, Sonnet for final generation |
| Interpret | < 10s | Same pattern |
| TTS start | < 1s after text | Stream response from OpenAI TTS |

---

## Production Upgrade Path (Post-Hackathon)

| Hackathon | Production |
|-----------|-----------|
| In-memory vector store | Pinecone / pgvector |
| OpenAI TTS | ElevenLabs British EN voice |
| Web app | React Native (iOS/Android) |
| Claude Sonnet | Fine-tuned safety layer + Sonnet |
| No STT | Whisper large-v3 |
| No auth | NHS Login or lightweight account |
