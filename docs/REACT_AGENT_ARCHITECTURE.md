# MAPLE ReACT Agent — Architecture & Search Tool Design

> **Feature:** Bill & Policy Q&A Chatbot  
> **Branch:** `maple_pr_2198_bot`  
> **Last updated:** August 2026

---

## Overview

The MAPLE chatbot is a LangGraph ReACT agent that answers questions about Massachusetts legislation by semantically searching a Firestore vector index. It supports bills, testimony, and ballot questions, with hearing transcripts and other sources extensible via a one-file pattern.

---

## System Architecture

```
User question (browser)
        │
        │  Firebase httpsCallable  (Auth token attached automatically)
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  CLOUD FUNCTION                                                 │
│  functions/src/llm/askQuestion.ts                               │
│                                                                 │
│  1. Validate input (zod, max 2000 chars)                        │
│  2. Read context.auth.uid  ← server-verified, cannot be forged  │
│  3. If logged-in: assertWithinBudget(uid)                       │
│  4. Run agent with tier limits                                  │
│  5. If logged-in: recordUsage(uid, tokensUsed)                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  LANGGRAPH REACT AGENT                                          │
│  functions/src/llm/agent.ts                                     │
│                                                                 │
│  createReactAgent(@langchain/langgraph/prebuilt)                │
│  Model: OpenAI gpt-4o-mini  •  temperature: 0                   │
│                                                                 │
│  ┌─────────┐    ┌──────────┐    ┌─────────────┐                │
│  │  THINK  │───▶│   ACT    │───▶│   OBSERVE   │                │
│  │  (LLM)  │    │ (tool    │    │ (tool result│                │
│  │         │◀───│  call)   │◀───│  in history)│                │
│  └─────────┘    └──────────┘    └─────────────┘                │
│       │                                                         │
│       └── enough context? ──▶  final ANSWER                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │  tool calls
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  VECTOR SEARCH TOOLS                                            │
│  functions/src/llm/vectorSearchTools.ts                         │
│                                                                 │
│  search_bills            collectionGroup("bills")               │
│  search_testimony        collectionGroup("publishedTestimony")  │
│  search_ballot_questions collection("ballotQuestions")          │
│                                                                 │
│  Each tool:                                                     │
│    1. embedText(query)  →  Vertex AI text-embedding-005         │
│    2. findNearest(field, vector, { COSINE, limit: 5 })          │
│    3. return formatted text snippets to the agent               │
└──────────────────────────┬──────────────────────────────────────┘
                           │  Firestore queries
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  FIRESTORE VECTOR INDEX                                         │
│                                                                 │
│  generalCourts/{court}/bills/{id}                               │
│    vector_embedding  ←  Title + DocumentText                    │
│                                                                 │
│  users/{uid}/publishedTestimony/{id}                            │
│    vector_embedding  ←  content                                 │
│                                                                 │
│  ballotQuestions/{id}                                           │
│    vector_embedding  ←  title + description + fullSummary       │
│                                                                 │
│  llmUsage/{uid}_{YYYY-MM}                                       │
│    tokensUsed  ←  monthly budget tracking (logged-in only)      │
└──────────────────────────┬──────────────────────────────────────┘
                           │  onWrite triggers (auto-index)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  VECTOR INDEXERS  (functions/src/{bills,testimony,             │
│                    ballotQuestions}/vector.ts)                  │
│                                                                 │
│  All call createVectorIndexer() factory                         │
│  • Hash check → skip if text unchanged (saves Vertex AI cost)   │
│  • embedText(text, title) → FieldValue.vector(embedding)        │
│  • Stores 768-dim VectorValue in vector_embedding field         │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Map

| File | Role |
|---|---|
| `functions/src/llm/askQuestion.ts` | Cloud Function entry point; auth, budget gate, tier limits |
| `functions/src/llm/agent.ts` | LangGraph `createReactAgent`; ReACT loop; token counting |
| `functions/src/llm/vectorSearchTools.ts` | Three LangChain tools; `findNearest()` wrapper; result formatting |
| `functions/src/llm/embeddings.ts` | Vertex AI `text-embedding-005` (768 dims); shared by indexers + tools |
| `functions/src/llm/usage.ts` | Monthly token budget; `assertWithinBudget`; `recordUsage` |
| `functions/src/llm/config.ts` | All tuning knobs (model, limits, budgets) in one place |
| `functions/src/llm/index.ts` | Exports `askQuestion` for Cloud Functions registration |
| `functions/src/search/createVectorIndexer.ts` | `onWrite` trigger factory; hash-guarded embedding + storage |
| `functions/src/bills/vector.ts` | Bill indexer (`generalCourts/{court}/bills/{id}`) |
| `functions/src/testimony/vector.ts` | Testimony indexer (`users/{uid}/publishedTestimony/{id}`) |
| `functions/src/ballotQuestions/vector.ts` | Ballot question indexer (`ballotQuestions/{id}`) |
| `components/llm/ChatWidget.tsx` | React chat UI; embeddable anywhere; `httpsCallable` |
| `components/llm/ChatWidget.module.css` | Scoped styles; no global leakage |
| `scripts/firebase-admin/backfill-embeddings.ts` | One-time backfill for pre-existing documents |

---

## Embedding Pipeline

```
Write path (indexing)                    Read path (querying)
─────────────────────                    ────────────────────
Document created/updated                 User types question
        │                                        │
        ▼                                        ▼
createVectorIndexer.onWrite          vectorSearchTools.tool()
        │                                        │
        ▼                                        ▼
  embedText(text, title)               embedText(query)
        │                                        │
        └──────────────┬─────────────────────────┘
                       ▼
           Vertex AI text-embedding-005
           768-dimensional vector
                       │
          ┌────────────┴──────────────┐
          ▼                           ▼
  FieldValue.vector(v)         findNearest(COSINE)
  stored in Firestore          ranked by similarity
```

**Critical:** Both paths use the same model (`text-embedding-005`, 768 dims, same title-prefix format). If they ever diverged, COSINE similarity scores would be meaningless.

---

## Cost & Usage Controls

### Configuration (`config.ts`)

| Setting | Anonymous | Logged-in |
|---|---|---|
| `maxOutputTokens` | 500 | 800 |
| `recursionLimit` | 6 (~3 tool calls) | 10 (~5 tool calls) |
| Monthly token budget | none (no identity) | 50,000 tokens |

### How anonymous limits work

Anonymous users have no persistent identity, so there is no meaningful way to track cross-request usage. Instead, cost is capped per-request via tight `maxOutputTokens` and `recursionLimit` values passed directly into the LangGraph agent. No Firestore read or write is needed.

### How logged-in limits work

Before running the agent, `assertWithinBudget(uid)` reads `llmUsage/{uid}_{YYYY-MM}`. If `tokensUsed >= 50000`, it throws `resource-exhausted`. After the agent finishes, `recordUsage` increments the count using `FieldValue.increment` (atomic — safe under concurrent requests).

Monthly budget resets automatically because the document ID includes the month (`{uid}_2026-08`, `{uid}_2026-09`, etc.). No scheduled job needed.

### Why `llmUsage` is a top-level collection

Firestore security rules grant users write access to `users/{uid}/{document=**}`. Putting usage documents there would let a user reset their own counter from the client. The separate `llmUsage` collection is writable only by Cloud Functions (server-side), which prevents this.

---

## Auth Security

```typescript
// askQuestion.ts
const uid = context.auth?.uid   // ← set by Firebase from the caller's Auth token
                                //   client cannot supply or spoof this field
```

The Firebase callable SDK automatically attaches the signed-in user's ID token to the request. Firebase verifies the token server-side before the function runs. The `uid` is either valid or `undefined` — there is no way for a client to pass a fake uid.

Auth state in the frontend (`useAuth()`) is used only to show the "sign in for a higher limit" hint. The actual enforcement is entirely server-side.

---

## Frontend Component

```tsx
// Drop into any page — requires no props
<ChatWidget />

// Optional title override
<ChatWidget title="Ask about this bill" />
```

`ChatWidget.tsx` has two external dependencies:
- `firebase/functions` — already in the app
- `components/firebase` — the shared Firebase app instance

It uses CSS Modules (`ChatWidget.module.css`) so styles are scoped and cannot conflict with the rest of the app.

---

## Adding a New Data Source (e.g. Hearing Transcripts)

Three steps, no changes to the agent or frontend:

**Step 1 — Index the collection** (`functions/src/hearingTranscripts/vector.ts`):
```typescript
import { createVectorIndexer } from "../search/createVectorIndexer"

export const syncHearingTranscriptToVectorIndex = createVectorIndexer({
  documentTrigger: "hearingTranscripts/{id}",
  textFields: ["transcript", "title"],
  vectorField: "vector_embedding",
  titleField: "title"
})
```

**Step 2 — Export from functions index** (`functions/src/index.ts`):
```typescript
export { syncHearingTranscriptToVectorIndex } from "./hearingTranscripts/vector"
```

**Step 3 — Add a search tool** (`functions/src/llm/vectorSearchTools.ts`):
```typescript
export const searchHearingTranscriptsTool = tool(
  async ({ query }: { query: string }) => {
    const embedding = await embedText(query)
    const docs = await findNearest(
      db.collection("hearingTranscripts"),
      embedding,
      LLM_CONFIG.vectorSearchTopK
    )
    if (docs.length === 0) return "No matching hearing transcripts found."
    return docs.map(doc => {
      const data = doc.data()
      return [
        `Hearing: ${data.title ?? doc.id} (${data.date ?? "unknown date"})`,
        `Transcript: ${truncate(data.transcript)}`
      ].join("\n")
    }).join("\n\n")
  },
  {
    name: "search_hearing_transcripts",
    description: "Semantic search over legislative hearing transcripts. Use this to find what was said at hearings on a bill or topic.",
    schema: z.object({ query: z.string() })
  }
)

// Append to the array:
export const vectorSearchTools = [
  searchBillsTool,
  searchTestimonyTool,
  searchBallotQuestionsTool,
  searchHearingTranscriptsTool   // ← new
]
```

Then run the backfill script to embed existing transcripts:
```bash
yarn firebase-admin run-script backfill-embeddings --env dev
```

---

## Backfilling Existing Documents

The `onWrite` triggers only index documents going forward. To embed documents that existed before the feature was deployed:

```bash
# Against dev environment
yarn firebase-admin run-script backfill-embeddings --env dev

# With a limit for testing
yarn firebase-admin run-script backfill-embeddings --env dev --limit 50

# Against production (after dev validation)
yarn firebase-admin run-script backfill-embeddings --env prod
```

The script skips documents where `vector_embedding` is already a `VectorValue` (has `.toArray()` method). Plain arrays from an older format are re-indexed.

---

## Local Development

```bash
# Start emulators + Next.js dev server
yarn dev:up

# Build functions TypeScript only
cd functions && yarn build

# Run functions tests
cd functions && yarn test
```

The `OPENAI_API_KEY` is a Firebase Secret in deployed environments. For local development, set it in `functions/.env`:
```
OPENAI_API_KEY=sk-...
```

Vertex AI calls (`text-embedding-005`) require valid GCP credentials. Set `GOOGLE_APPLICATION_CREDENTIALS` to a service account key file with `aiplatform.endpoints.predict` permission.

---

## Dependencies

All in `functions/package.json`:

| Package | Purpose |
|---|---|
| `@langchain/langgraph` `^0.2.0` | ReACT agent state machine (`createReactAgent`) |
| `@langchain/openai` `^0.3.0` | `ChatOpenAI` model wrapper |
| `@langchain/core` `^0.3.0` | `tool()` definition, `BaseMessage` types |
| `@google-cloud/aiplatform` `^3.9.0` | Vertex AI prediction client for embeddings |
| `@google-cloud/firestore` `^5.0.2` | Firestore client (v5 typings; runtime uses Admin v12 bundled v7) |
| `firebase-admin` `^12.0.0` | `FieldValue.vector()`, callable function context |
| `zod` `^3.20.2` | Request validation and tool input schemas |
