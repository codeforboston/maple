import {
  GoogleGenerativeAIEmbeddings,
  type GoogleGenerativeAIEmbeddingsParams
} from "@langchain/google-genai"
import { Pool } from "pg"

/** Anything with pg's `query(text, params) -> { rows }` shape: a pg Pool, or PGlite in tests. */
export interface Queryable {
  query(text: string, params?: unknown[]): Promise<{ rows: any[] }>
}

let pool: Pool | undefined
export function getPool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set")
  // A hung query must not hold a run open.
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    statement_timeout: 10_000
  })
  return pool
}

// --- Embeddings ---------------------------------------------------------

export type EmbedKind = "document" | "query"

export function embeddingConfig() {
  return {
    model: process.env.EMBEDDING_MODEL ?? "gemini-embedding-001",
    dims: Number(process.env.EMBEDDING_DIMS ?? 768)
  }
}

/** gemini-embedding-001 returns unnormalized vectors below 3072 dims; also rejects the [] that failed batches yield. */
export function normalize(v: number[], dims: number): number[] {
  if (v.length !== dims)
    throw new Error(`Embedding has ${v.length} dims, expected ${dims}`)
  const norm = Math.hypot(...v)
  if (norm === 0) throw new Error("Embedding is all zeros")
  return v.map(x => x / norm)
}

const embedders = new Map<EmbedKind, GoogleGenerativeAIEmbeddings>()
function embedder(kind: EmbedKind) {
  const { model, dims } = embeddingConfig()
  let e = embedders.get(kind)
  if (!e) {
    e = new GoogleGenerativeAIEmbeddings({
      model,
      outputDimensionality: dims,
      taskType: (kind === "query"
        ? "RETRIEVAL_QUERY"
        : "RETRIEVAL_DOCUMENT") as GoogleGenerativeAIEmbeddingsParams["taskType"]
    })
    embedders.set(kind, e)
  }
  return e
}

/** The one embedding function for memory writes and searches. */
export async function embed(text: string, kind: EmbedKind): Promise<number[]> {
  return normalize(
    await embedder(kind).embedQuery(text),
    embeddingConfig().dims
  )
}

export type EmbedFn = (text: string, kind: EmbedKind) => Promise<number[]>

/** pgvector literal for a `$n::vector` parameter. */
export const toVector = (v: number[]) => `[${v.join(",")}]`

/** Startup check: every filled table must match the current embedding config. */
export function assertEmbeddingMeta(
  rows: { table_name: string; model: string; dims: number }[],
  config = embeddingConfig()
) {
  for (const r of rows) {
    if (r.model !== config.model || r.dims !== config.dims)
      throw new Error(
        `${r.table_name} was embedded with ${r.model}/${r.dims}, but config is ${config.model}/${config.dims}. Fix EMBEDDING_MODEL/EMBEDDING_DIMS, or clear the table and re-run setup-db.`
      )
  }
}

export async function checkEmbeddingMeta(db: Queryable) {
  const { rows } = await db.query(
    "select table_name, model, dims from embedding_meta"
  )
  assertEmbeddingMeta(rows)
}

// --- Memory -----------------------------------------------------------------

export type MemoryHit = { threadId: string; content: string; createdAt: string }

export async function searchMemories(
  db: Queryable,
  userId: string,
  vec: number[],
  opts: { since?: string; until?: string; limit: number }
): Promise<MemoryHit[]> {
  const { rows } = await db.query(
    `select thread_id, content, created_at from chat_memories
      where user_id = $1
        and ($3::timestamptz is null or created_at >= $3)
        and ($4::timestamptz is null or created_at < $4)
      order by embedding <=> $2::vector limit $5`,
    [userId, toVector(vec), opts.since ?? null, opts.until ?? null, opts.limit]
  )
  return rows.map(r => ({
    threadId: r.thread_id,
    content: r.content,
    createdAt: new Date(r.created_at).toISOString()
  }))
}

export async function upsertMemory(
  db: Queryable,
  m: {
    userId: string
    threadId: string
    runId: string
    content: string
    embedding: number[]
  }
) {
  await db.query(
    `insert into chat_memories (user_id, thread_id, run_id, content, embedding)
     values ($1, $2, $3, $4, $5::vector)
     on conflict (thread_id, run_id) do update set content = excluded.content, embedding = excluded.embedding`,
    [m.userId, m.threadId, m.runId, m.content, toVector(m.embedding)]
  )
}

// --- Usage --------------------------------------------------------

/** This month's tokens for one user, or for every user when userId is null (the global cap). */
export async function monthTokens(
  db: Queryable,
  userId: string | null
): Promise<number> {
  const { rows } = await db.query(
    `select coalesce(sum(tokens), 0)::bigint as tokens from usage
      where ($1::text is null or user_id = $1) and month = date_trunc('month', now())::date`,
    [userId]
  )
  return Number(rows[0]?.tokens ?? 0)
}

export async function addUsage(db: Queryable, userId: string, tokens: number) {
  await db.query(
    `insert into usage (user_id, month, tokens) values ($1, date_trunc('month', now())::date, $2)
     on conflict (user_id, month) do update set tokens = usage.tokens + excluded.tokens`,
    [userId, tokens]
  )
}
