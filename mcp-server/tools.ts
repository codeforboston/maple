import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import * as admin from "firebase-admin"
import { PredictionServiceClient, helpers } from "@google-cloud/aiplatform"
import { z } from "zod"

// Lazily initialize db so we don't call admin.firestore() before initializeApp() runs in index.ts
const getDb = () => admin.firestore()

// Vertex AI Configuration
const project = process.env.FIREBASE_PROJECT_ID
const location = "us-central1"
const publisher = "google"
const model = "text-embedding-005"
const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`

let client: PredictionServiceClient | null = null

function getClient() {
  if (!client) {
    try {
      client = new PredictionServiceClient({
        apiEndpoint: `${location}-aiplatform.googleapis.com`
      })
    } catch (err) {
      console.error("Failed to initialize PredictionServiceClient:", err)
      throw err
    }
  }
  return client
}

async function getEmbedding(
  text: string,
  isQuery: boolean,
  title?: string
): Promise<number[]> {
  const formattedText = isQuery
    ? `task: search result | query: ${text}`
    : `title: ${title || "none"} | text: ${text}`

  const instance = helpers.toValue({ content: formattedText })!
  const parameters = helpers.toValue({ outputDimensionality: 768 })!
  const responseArray = (await getClient().predict({
    endpoint,
    instances: [instance],
    parameters
  })) as any
  const response = responseArray[0]

  if (!response.predictions || response.predictions.length === 0) {
    throw new Error("No predictions returned from Vertex AI")
  }

  const prediction = helpers.fromValue(response.predictions[0] as any) as any
  const embedding =
    prediction.embeddings?.values || prediction.embedding?.values

  if (!embedding) {
    throw new Error(
      `Unexpected prediction format: ${JSON.stringify(prediction)}`
    )
  }

  return embedding
}

/**
 * Shape a raw Firestore bill document into a compact, model-friendly object.
 *
 * Strips: DocumentText, Cosponsors[], CommitteeRecommendations[], RollCalls[],
 *         Attachments[], BillHistory URL, full history[], vector_embedding.
 * Keeps:  id, court, billNumber, legislationType, title, primarySponsor,
 *         summary, pinslip, topics, engagement counts, latestAction,
 *         similar[], relevanceScore.
 */
export function shapeBill(doc: any, includeFullText: boolean): object {
  const data = doc.data()
  const content = data.content ?? {}
  const history: any[] = data.history ?? []

  const shaped: Record<string, any> = {
    relevanceScore:
      typeof doc.get === "function" && doc.get("distance") != null
        ? Math.round((1 - doc.get("distance")) * 1000) / 1000
        : null,
    id: doc.id,
    path: doc.ref.path,
    court: data.court ?? null,
    billNumber: content.BillNumber ?? null,
    legislationType: content.LegislationTypeName ?? null,
    title: content.Title ?? null,
    primarySponsor: content.PrimarySponsor?.Name ?? null,
    summary: data.summary ?? null,
    pinslip: content.Pinslip ?? null,
    topics: data.topics ?? [],
    cosponsorCount: data.cosponsorCount ?? 0,
    endorseCount: data.endorseCount ?? 0,
    opposeCount: data.opposeCount ?? 0,
    neutralCount: data.neutralCount ?? 0,
    testimonyCount: data.testimonyCount ?? 0,
    latestAction: history.length > 0 ? history[history.length - 1] : null,
    similar: data.similar ?? [],
    nextHearingAt: data.nextHearingAt ?? null
  }

  if (includeFullText) {
    shaped.documentText = content.DocumentText ?? null
  }

  return shaped
}

/**
 * Shape a raw Firestore publishedTestimony document into a compact object.
 * Strips vector_embedding and the raw distance field.
 * Keeps: id, path, relevanceScore, author info, billId/billTitle,
 *        ballotQuestionId, court, position, publishedAt, content (or truncated).
 */
export function shapeTestimony(doc: any, includeFullText: boolean): object {
  const data = doc.data()

  const shaped: Record<string, any> = {
    relevanceScore:
      typeof doc.get === "function" && doc.get("distance") != null
        ? Math.round((1 - doc.get("distance")) * 1000) / 1000
        : null,
    id: doc.id,
    path: doc.ref.path,
    authorDisplayName: data.authorDisplayName ?? null,
    authorRole: data.authorRole ?? null,
    billId: data.billId ?? null,
    billTitle: data.billTitle ?? null,
    ballotQuestionId: data.ballotQuestionId ?? null,
    court: data.court ?? null,
    position: data.position ?? null,
    publishedAt: data.publishedAt ?? null,
    public: data.public ?? null
  }

  if (includeFullText) {
    shaped.content = data.content ?? null
  } else {
    shaped.contentPreview = data.content
      ? data.content.slice(0, 300) + (data.content.length > 300 ? "…" : "")
      : null
  }

  return shaped
}

/**
 * Shape a raw Firestore ballot question document into a compact object.
 * Strips vector_embedding and any large nested arrays.
 */
export function shapeBallotQuestion(
  doc: any,
  includeFullText: boolean
): object {
  const data = doc.data()

  const shaped: Record<string, any> = {
    relevanceScore:
      typeof doc.get === "function" && doc.get("distance") != null
        ? Math.round((1 - doc.get("distance")) * 1000) / 1000
        : null,
    id: doc.id,
    path: doc.ref.path,
    type: "ballot_question",
    title: data.title ?? null,
    summary: data.summary ?? null,
    topics: data.topics ?? [],
    endorseCount: data.endorseCount ?? 0,
    opposeCount: data.opposeCount ?? 0,
    neutralCount: data.neutralCount ?? 0,
    testimonyCount: data.testimonyCount ?? 0
  }

  if (includeFullText) {
    shaped.fullText = data.fullText ?? data.text ?? null
  }

  return shaped
}

const SearchSchema = {
  query: z.string().describe("The search query"),
  limit: z
    .number()
    .optional()
    .default(5)
    .describe("Maximum number of results to return"),
  legislationType: z
    .enum(["Bill", "Order", "Resolution"])
    .optional()
    .describe(
      "Filter by legislation type. Use 'Bill' to exclude committee study orders and procedural items."
    ),
  includeFullText: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Include full DocumentText in results. Omit unless you need the bill's complete statutory language — it greatly increases response size."
    )
}

const TestimonySearchSchema = {
  query: z.string().describe("The search query"),
  policyType: z
    .enum(["bill", "ballot"])
    .optional()
    .describe("Filter by policy type"),
  policyId: z.string().optional().describe("Filter by specific policy ID"),
  limit: z
    .number()
    .optional()
    .default(5)
    .describe("Maximum number of results to return"),
  includeFullText: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Include full testimony text in results. Omit to receive a 300-character preview instead."
    )
}

export function registerTools(server: McpServer) {
  server.registerTool(
    "search_bills",
    {
      description:
        "Search legislative bills using natural language. Returns compact summaries by default; use includeFullText for statutory language. Filter by legislationType='Bill' to exclude committee study orders.",
      inputSchema: SearchSchema
    },
    async ({ query, limit, legislationType, includeFullText }: any) => {
      const embedding = await getEmbedding(query as string, true)
      const billsRef = getDb().collectionGroup("bills")

      const results = await (billsRef as any)
        .findNearest({
          vectorField: "vector_embedding",
          queryVector: embedding,
          distanceMeasure: "COSINE",
          distanceResultField: "distance",
          limit: limit as number
        })
        .get()

      let docs: any[] = results.docs

      if (legislationType) {
        docs = docs.filter(
          (doc: any) =>
            (doc.data().content?.LegislationTypeName ?? "") === legislationType
        )
      }

      const bills = docs.map((doc: any) =>
        shapeBill(doc, includeFullText as boolean)
      )

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(bills, null, 2) }
        ]
      }
    }
  )

  server.registerTool(
    "search_testimony",
    {
      description:
        "Search testimony using natural language. Returns relevanceScore, author info, position, and a content preview by default; use includeFullText for the full testimony text. Optionally filter to a specific bill or ballot question with policyType + policyId.",
      inputSchema: TestimonySearchSchema
    },
    async ({ query, policyType, policyId, limit, includeFullText }: any) => {
      const embedding = await getEmbedding(query as string, true)
      let testimonyRef: any = getDb().collectionGroup("publishedTestimony")

      if (policyType === "bill" && policyId) {
        testimonyRef = testimonyRef.where("billId", "==", policyId)
      } else if (policyType === "ballot" && policyId) {
        testimonyRef = testimonyRef.where("ballotQuestionId", "==", policyId)
      }

      const results = await testimonyRef
        .findNearest({
          vectorField: "vector_embedding",
          queryVector: embedding,
          distanceMeasure: "COSINE",
          distanceResultField: "distance",
          limit: limit as number
        })
        .get()

      const testimony = results.docs.map((doc: any) =>
        shapeTestimony(doc, includeFullText as boolean)
      )

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(testimony, null, 2) }
        ]
      }
    }
  )

  server.registerTool(
    "search_ballot_questions",
    {
      description:
        "Search ballot questions using natural language. Returns compact summaries by default; use includeFullText for full question text.",
      inputSchema: SearchSchema
    },
    async ({ query, limit, includeFullText }: any) => {
      const embedding = await getEmbedding(query as string, true)
      const bqRef = getDb().collection("ballotQuestions")

      const results = await (bqRef as any)
        .findNearest({
          vectorField: "vector_embedding",
          queryVector: embedding,
          distanceMeasure: "COSINE",
          distanceResultField: "distance",
          limit: limit as number
        })
        .get()

      const questions = results.docs.map((doc: any) =>
        shapeBallotQuestion(doc, includeFullText as boolean)
      )

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(questions, null, 2) }
        ]
      }
    }
  )

  server.registerTool(
    "search_policies",
    {
      description:
        "Unified search across bills and ballot questions, deduplicated and sorted by relevance. Returns compact summaries by default; use includeFullText for full statutory/question text.",
      inputSchema: SearchSchema
    },
    async ({ query, limit, legislationType, includeFullText }: any) => {
      const embedding = await getEmbedding(query as string, true)

      const billsPromise = (getDb().collectionGroup("bills") as any)
        .findNearest({
          vectorField: "vector_embedding",
          queryVector: embedding,
          distanceMeasure: "COSINE",
          distanceResultField: "distance",
          limit: limit as number
        })
        .get()

      const bqPromise = (getDb().collection("ballotQuestions") as any)
        .findNearest({
          vectorField: "vector_embedding",
          queryVector: embedding,
          distanceMeasure: "COSINE",
          distanceResultField: "distance",
          limit: limit as number
        })
        .get()

      const [billsResults, bqResults] = await Promise.all([
        billsPromise,
        bqPromise
      ])

      let billDocs: any[] = (billsResults as any).docs
      if (legislationType) {
        billDocs = billDocs.filter(
          (doc: any) =>
            (doc.data().content?.LegislationTypeName ?? "") === legislationType
        )
      }

      const shapedBills = billDocs.map((doc: any) => ({
        type: "bill" as const,
        ...shapeBill(doc, includeFullText as boolean)
      }))

      const shapedBallotQuestions = (bqResults as any).docs.map((doc: any) =>
        shapeBallotQuestion(doc, includeFullText as boolean)
      )

      // Merge, deduplicate by id, sort by relevanceScore descending
      const seen = new Set<string>()
      const merged = [...shapedBills, ...shapedBallotQuestions]
        .filter((item: any) => {
          if (seen.has(item.id)) return false
          seen.add(item.id)
          return true
        })
        .sort(
          (a: any, b: any) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0)
        )
        .slice(0, (limit as number) * 2)

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(merged, null, 2)
          }
        ]
      }
    }
  )
}
