/**
 * Core Firestore vector search helpers for policy content (bills + ballot
 * questions). These functions are the single source of truth for how the
 * ReAct agent retrieves policy documents — reused by vectorSearchTools.ts
 * so that each LangChain tool is a thin wrapper rather than duplicating
 * Firestore/embedding logic.
 *
 * The MCP server (mcp-server/tools.ts) owns its own copy of these queries
 * because it runs in a separate process with a separate Firestore client and
 * a slightly different embedding call convention (isQuery task-type prefix).
 * If the two ever diverge materially, consolidate into a shared library
 * package; for now keeping them separate avoids a cross-package build
 * dependency.
 */

import { Query } from "firebase-admin/firestore"
import { db, DocumentData, QueryDocumentSnapshot } from "../firebase"
import { embedText } from "./embeddings"
import { LLM_CONFIG } from "./config"

// ---------------------------------------------------------------------------
// Firestore findNearest wrapper
// ---------------------------------------------------------------------------

const VECTOR_FIELD = "vector_embedding"

/**
 * Runs a Firestore vector similarity search (COSINE) against the given
 * collection/collectionGroup query.
 *
 * firebase-admin's bundled Firestore client (v7) supports findNearest(), but
 * this project's direct @google-cloud/firestore dependency is pinned at v5
 * whose typings predate it. Cast to bridge the gap (same pattern used in
 * search/createVectorIndexer.ts for FieldValue.vector()).
 */
export async function findNearest(
  query: Query<DocumentData>,
  embedding: number[],
  limit: number
): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  const vectorQuery = query as unknown as {
    findNearest(
      field: string,
      queryVector: number[],
      options: { limit: number; distanceMeasure: "COSINE" }
    ): { get(): Promise<{ docs: QueryDocumentSnapshot<DocumentData>[] }> }
  }

  const snapshot = await vectorQuery
    .findNearest(VECTOR_FIELD, embedding, {
      limit,
      distanceMeasure: "COSINE"
    })
    .get()

  return snapshot.docs
}

// ---------------------------------------------------------------------------
// Result formatters (plain text snippets for LLM consumption)
// ---------------------------------------------------------------------------

const MAX_SNIPPET_LENGTH = 800

function truncate(text: string | undefined, length = MAX_SNIPPET_LENGTH): string {
  if (!text) return ""
  return text.length > length ? `${text.slice(0, length)}...` : text
}

export function formatBillDoc(doc: QueryDocumentSnapshot<DocumentData>): string {
  const data = doc.data()
  const court = doc.ref.parent.parent?.id ?? "unknown"
  return [
    `Bill ${data.id ?? doc.id} (court ${court})`,
    `Title: ${data.content?.Title ?? "Unknown"}`,
    `Text: ${truncate(data.content?.DocumentText)}`
  ].join("\n")
}

export function formatBallotQuestionDoc(
  doc: QueryDocumentSnapshot<DocumentData>
): string {
  const data = doc.data()
  return [
    `Ballot Question ${doc.id} (${data.electionYear ?? "unknown year"}, status: ${data.ballotStatus ?? "unknown"})`,
    `Title: ${data.title ?? "Unknown"}`,
    `Summary: ${truncate(data.fullSummary ?? data.description)}`
  ].join("\n")
}

// ---------------------------------------------------------------------------
// Testimony formatters
// ---------------------------------------------------------------------------

export function formatTestimonyDoc(
  doc: QueryDocumentSnapshot<DocumentData>
): string {
  const data = doc.data()
  const subject = data.billId
    ? `bill ${data.billId} (${data.billTitle ?? "unknown title"})`
    : data.ballotQuestionId
    ? `ballot question ${data.ballotQuestionId}`
    : "unknown policy"
  return [
    `Testimony on ${subject}`,
    `Author: ${data.authorDisplayName ?? "anonymous"}`,
    `Position: ${data.position ?? "not stated"}`,
    `Content: ${truncate(data.content)}`
  ].join("\n")
}

// ---------------------------------------------------------------------------
// Core testimony search functions
// ---------------------------------------------------------------------------

/**
 * Semantic search over testimony on bills. Optionally scope to a specific
 * bill by passing billId. Mirrors the bill path of the MCP server's
 * search_testimony (policyType="bill") in mcp-server/tools.ts.
 */
export async function searchBillTestimony(
  query: string,
  billId?: string,
  topK = LLM_CONFIG.vectorSearchTopK
): Promise<string> {
  const embedding = await embedText(query)
  let base: Query<DocumentData> = db.collectionGroup("publishedTestimony")
  if (billId) base = base.where("billId", "==", billId)

  const docs = await findNearest(base, embedding, topK)
  if (docs.length === 0) return "No matching bill testimony found."
  return docs.map(formatTestimonyDoc).join("\n\n")
}

/**
 * Semantic search over testimony on ballot questions. Optionally scope to a
 * specific question by passing ballotQuestionId. Mirrors the ballot path of
 * the MCP server's search_testimony (policyType="ballot") in
 * mcp-server/tools.ts.
 */
export async function searchBallotQuestionTestimony(
  query: string,
  ballotQuestionId?: string,
  topK = LLM_CONFIG.vectorSearchTopK
): Promise<string> {
  const embedding = await embedText(query)
  let base: Query<DocumentData> = db.collectionGroup("publishedTestimony")
  if (ballotQuestionId)
    base = base.where("ballotQuestionId", "==", ballotQuestionId)

  const docs = await findNearest(base, embedding, topK)
  if (docs.length === 0) return "No matching ballot question testimony found."
  return docs.map(formatTestimonyDoc).join("\n\n")
}

/**
 * Unified semantic search across all testimony (bills + ballot questions).
 * Runs one collectionGroup query with no policyType filter, then formats
 * each result with enough context for the LLM to tell which type it is.
 * Use as the default when the question doesn't specify a policy type.
 */
export async function searchTestimony(
  query: string,
  topK = LLM_CONFIG.vectorSearchTopK
): Promise<string> {
  const embedding = await embedText(query)
  const docs = await findNearest(
    db.collectionGroup("publishedTestimony"),
    embedding,
    topK
  )
  if (docs.length === 0) return "No matching testimony found."
  return docs.map(formatTestimonyDoc).join("\n\n")
}

/**
 * Semantic search over Massachusetts legislative bills (all courts).
 * Returns a formatted text block ready for LLM consumption, or a
 * "no results" string.
 */
export async function searchBills(
  query: string,
  topK = LLM_CONFIG.vectorSearchTopK
): Promise<string> {
  const embedding = await embedText(query)
  const docs = await findNearest(db.collectionGroup("bills"), embedding, topK)

  if (docs.length === 0) return "No matching bills found."

  return docs.map(formatBillDoc).join("\n\n")
}

/**
 * Semantic search over statewide ballot questions.
 * Returns a formatted text block ready for LLM consumption, or a
 * "no results" string.
 */
export async function searchBallotQuestions(
  query: string,
  topK = LLM_CONFIG.vectorSearchTopK
): Promise<string> {
  const embedding = await embedText(query)
  const docs = await findNearest(
    db.collection("ballotQuestions"),
    embedding,
    topK
  )

  if (docs.length === 0) return "No matching ballot questions found."

  return docs.map(formatBallotQuestionDoc).join("\n\n")
}

/**
 * Unified semantic search across bills AND ballot questions, sorted by
 * relevance. Runs both queries in parallel (matching the MCP server's
 * search_policies pattern in mcp-server/tools.ts) and merges results by
 * COSINE distance before formatting.
 *
 * Returns a formatted text block ready for LLM consumption, or a
 * "no results" string.
 */
export async function searchPolicies(
  query: string,
  topK = LLM_CONFIG.vectorSearchTopK
): Promise<string> {
  const embedding = await embedText(query)

  // Run both searches in parallel — same pattern as search_policies in
  // mcp-server/tools.ts
  const [billDocs, bqDocs] = await Promise.all([
    findNearest(db.collectionGroup("bills"), embedding, topK),
    findNearest(db.collection("ballotQuestions"), embedding, topK)
  ])

  if (billDocs.length === 0 && bqDocs.length === 0) {
    return "No matching bills or ballot questions found."
  }

  // Attach a numeric distance to each doc for sorting. findNearest returns
  // docs ordered by distance ascending; assign a rank-based proxy so that
  // interleaving preserves relative ordering within each result set.
  type RankedDoc = {
    rank: number
    formatted: string
  }

  const rankedBills: RankedDoc[] = billDocs.map((doc, i) => ({
    rank: i,
    formatted: `[Bill]\n${formatBillDoc(doc)}`
  }))

  const rankedBqs: RankedDoc[] = bqDocs.map((doc, i) => ({
    rank: i,
    formatted: `[Ballot Question]\n${formatBallotQuestionDoc(doc)}`
  }))

  // Merge by interleaving: pick the lower-rank item from each list at each
  // step, which preserves the relative relevance ordering from Firestore.
  const merged: string[] = []
  let bi = 0
  let qi = 0
  while (bi < rankedBills.length || qi < rankedBqs.length) {
    const bill = rankedBills[bi]
    const bq = rankedBqs[qi]
    if (!bq || (bill && bill.rank <= bq.rank)) {
      merged.push(bill.formatted)
      bi++
    } else {
      merged.push(bq.formatted)
      qi++
    }
  }

  return merged.slice(0, topK * 2).join("\n\n")
}
