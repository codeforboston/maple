import { Query } from "firebase-admin/firestore"
import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { db, DocumentData, QueryDocumentSnapshot } from "../firebase"
import { embedText } from "./embeddings"
import { LLM_CONFIG } from "./config"

const VECTOR_FIELD = "vector_embedding"
const MAX_SNIPPET_LENGTH = 800

function truncate(text: string | undefined, length = MAX_SNIPPET_LENGTH): string {
  if (!text) return ""
  return text.length > length ? `${text.slice(0, length)}...` : text
}

/**
 * Runs a Firestore vector similarity search against `query`.
 *
 * firebase-admin's bundled Firestore client (v7) supports `findNearest()`,
 * but this project's direct `@google-cloud/firestore` dependency is pinned
 * at v5, whose typings predate it - the same situation documented in
 * `search/createVectorIndexer.ts` for `FieldValue.vector()`. Cast to bridge
 * the type gap.
 */
async function findNearest(
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

export const searchBillsTool = tool(
  async ({ query }: { query: string }) => {
    const embedding = await embedText(query)
    const docs = await findNearest(
      db.collectionGroup("bills"),
      embedding,
      LLM_CONFIG.vectorSearchTopK
    )

    if (docs.length === 0) return "No matching bills found."

    return docs
      .map(doc => {
        const data = doc.data()
        const court = doc.ref.parent.parent?.id ?? "unknown"
        return [
          `Bill ${data.id ?? doc.id} (court ${court})`,
          `Title: ${data.content?.Title ?? "Unknown"}`,
          `Text: ${truncate(data.content?.DocumentText)}`
        ].join("\n")
      })
      .join("\n\n")
  },
  {
    name: "search_bills",
    description:
      "Semantic search over Massachusetts legislative bills (title and full text). Use this to find bills related to a topic, policy area, or question.",
    schema: z.object({
      query: z.string().describe("A natural-language description of the bill topic to search for")
    })
  }
)

export const searchTestimonyTool = tool(
  async ({ query, billId }: { query: string; billId?: string }) => {
    const embedding = await embedText(query)
    let base: Query<DocumentData> = db.collectionGroup("publishedTestimony")
    if (billId) base = base.where("billId", "==", billId)

    const docs = await findNearest(base, embedding, LLM_CONFIG.vectorSearchTopK)

    if (docs.length === 0) return "No matching testimony found."

    return docs
      .map(doc => {
        const data = doc.data()
        return [
          `Testimony on bill ${data.billId ?? "unknown"} (${data.billTitle ?? "unknown title"})`,
          `Author: ${data.authorDisplayName ?? "anonymous"}`,
          `Content: ${truncate(data.content)}`
        ].join("\n")
      })
      .join("\n\n")
  },
  {
    name: "search_testimony",
    description:
      "Semantic search over public testimony submitted on bills. Optionally scope to a specific bill by ID. Use this to find what people have said about a bill or issue.",
    schema: z.object({
      query: z.string().describe("A natural-language description of the testimony content to search for"),
      billId: z.string().optional().describe("Optional bill ID to restrict results to testimony on that bill")
    })
  }
)

export const searchBallotQuestionsTool = tool(
  async ({ query }: { query: string }) => {
    const embedding = await embedText(query)
    const docs = await findNearest(
      db.collection("ballotQuestions"),
      embedding,
      LLM_CONFIG.vectorSearchTopK
    )

    if (docs.length === 0) return "No matching ballot questions found."

    return docs
      .map(doc => {
        const data = doc.data()
        return [
          `Ballot Question ${doc.id} (${data.electionYear ?? "unknown year"}, status: ${data.ballotStatus ?? "unknown"})`,
          `Title: ${data.title ?? "Unknown"}`,
          `Summary: ${truncate(data.fullSummary ?? data.description)}`
        ].join("\n")
      })
      .join("\n\n")
  },
  {
    name: "search_ballot_questions",
    description:
      "Semantic search over statewide ballot questions (title, description, and summary). Use this for questions about ballot initiatives or referenda.",
    schema: z.object({
      query: z.string().describe("A natural-language description of the ballot question topic to search for")
    })
  }
)

// Adding a new source type (e.g. hearing transcripts) later just means
// indexing it with createVectorIndexer and adding one more tool() here in
// the same shape.
export const vectorSearchTools = [
  searchBillsTool,
  searchTestimonyTool,
  searchBallotQuestionsTool
]
