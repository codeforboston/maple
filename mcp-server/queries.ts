// Firestore queries behind the MCP tools. registerTools (tools.ts) wraps them, and the Ask MAPLE
// agent (chat-agent/) calls them in-process.
import * as admin from "firebase-admin"
import { PredictionServiceClient, helpers } from "@google-cloud/aiplatform"
import { z } from "zod"

// Lazily initialize db so we don't call admin.firestore() before initializeApp() runs in index.ts
export const getDb = () => admin.firestore()

// Current General Court session.
// Source of truth: functions/src/shared/constants.ts → currentGeneralCourt
// Override at deploy time via CURRENT_COURT env var; fallback keeps local dev working.
const CURRENT_COURT = process.env.CURRENT_COURT
  ? parseInt(process.env.CURRENT_COURT, 10)
  : 194

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

export async function getEmbedding(
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
 *         summary, pinslip, topics, currentCommittee, engagement counts,
 *         latestAction, similar[], relevanceScore.
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
    currentCommittee: data.currentCommittee
      ? { id: data.currentCommittee.id, name: data.currentCommittee.name }
      : null,
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
 *
 * Strips: vector_embedding, public flag (internal attribution marker).
 * Anonymizes: author fields are masked for users with private profiles
 *   (public === false) — the testimony content remains, matching the public
 *   legislative record, but the author's identity is hidden per their preference.
 * Keeps: id, path, relevanceScore, author info (if public), billId/billTitle,
 *        ballotQuestionId, court, position, publishedAt, content (or truncated).
 */
export function shapeTestimony(doc: any, includeFullText: boolean): object {
  const data = doc.data()
  const isPublicAuthor = data.public !== false

  const shaped: Record<string, any> = {
    relevanceScore:
      typeof doc.get === "function" && doc.get("distance") != null
        ? Math.round((1 - doc.get("distance")) * 1000) / 1000
        : null,
    id: doc.id,
    path: doc.ref.path,
    authorDisplayName: isPublicAuthor
      ? data.authorDisplayName ?? null
      : "Anonymous",
    authorRole: isPublicAuthor ? data.authorRole ?? null : null,
    billId: data.billId ?? null,
    billTitle: data.billTitle ?? null,
    ballotQuestionId: data.ballotQuestionId ?? null,
    court: data.court ?? null,
    position: data.position ?? null,
    publishedAt: data.publishedAt ?? null
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

// ---------------------------------------------------------------------------
// Schema definitions
// ---------------------------------------------------------------------------

export const SearchSchema = {
  query: z.string().describe("The search query"),
  limit: z
    .number()
    .optional()
    .default(5)
    .describe(
      "Maximum number of results to return. Note: Firestore vector search does not support cursors or offsets — for exhaustive topic enumeration, use list_topics and the topic filter instead of paging."
    ),
  legislationType: z
    .enum(["Bill", "Order", "Resolution"])
    .optional()
    .describe(
      "Filter by legislation type. Use 'Bill' to exclude committee study orders and procedural items."
    ),
  topic: z
    .string()
    .optional()
    .describe(
      "Filter by AI-assigned topic tag (e.g. 'Water quality', 'Mental health'). These are fine-grained subject labels assigned by an LLM to each bill. Use list_topics to see all valid values."
    ),
  committee: z
    .string()
    .optional()
    .describe(
      "Filter by current committee name (e.g. 'Joint Committee on Environment, Natural Resources and Agriculture'). Use list_committees to see all valid values."
    ),
  primarySponsor: z
    .string()
    .optional()
    .describe(
      "Filter by primary sponsor name (e.g. 'Cynthia Creem'). Use list_sponsors to see valid values."
    ),
  court: z
    .number()
    .optional()
    .default(CURRENT_COURT)
    .describe(
      `Legislature session (General Court) number. Defaults to the current ${CURRENT_COURT}th session. Pass an older number (e.g. 193) to search a prior session.`
    ),
  includeFullText: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Include full DocumentText in results. Omit unless you need the bill's complete statutory language — it greatly increases response size."
    )
}

export const TestimonySearchSchema = {
  query: z.string().describe("The search query"),
  policyType: z
    .enum(["bill", "ballot"])
    .optional()
    .describe("Filter by policy type"),
  policyId: z.string().optional().describe("Filter by specific policy ID"),
  authorDisplayName: z
    .string()
    .optional()
    .describe(
      "Filter by author display name. Only returns testimony from users with public profiles — private-profile users cannot be searched by name."
    ),
  limit: z
    .number()
    .optional()
    .default(5)
    .describe("Maximum number of results to return"),
  court: z
    .number()
    .optional()
    .default(CURRENT_COURT)
    .describe(
      `Legislature session (General Court) number. Defaults to the current ${CURRENT_COURT}th session. Pass an older number (e.g. 193) to search a prior session.`
    ),
  includeFullText: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Include full testimony text in results. Omit to receive a 300-character preview instead."
    )
}

export const ListSchema = {
  court: z
    .number()
    .optional()
    .default(CURRENT_COURT)
    .describe(
      `Legislature session (General Court) number. Defaults to the current ${CURRENT_COURT}th session.`
    )
}

// ---------------------------------------------------------------------------
// Post-filter helper
// ---------------------------------------------------------------------------

/**
 * When metadata filters are active, fetch a larger candidate set from vector
 * search and apply the filters in-process before slicing to `limit`.
 */
export function applyBillPostFilters(
  docs: any[],
  {
    legislationType,
    topic,
    committee,
    primarySponsor
  }: {
    legislationType?: string
    topic?: string
    committee?: string
    primarySponsor?: string
  }
): any[] {
  return docs.filter(doc => {
    const data = doc.data()
    const content = data.content ?? {}
    if (
      legislationType &&
      (content.LegislationTypeName ?? "") !== legislationType
    )
      return false
    if (
      topic &&
      !((data.topics ?? []) as any[]).some((t: any) => t.topic === topic)
    )
      return false
    if (committee && (data.currentCommittee?.name ?? "") !== committee)
      return false
    if (
      primarySponsor &&
      (content.PrimarySponsor?.Name ?? "") !== primarySponsor
    )
      return false
    return true
  })
}
// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
// Each parses its arguments with the tool's schema, so callers outside the MCP
// SDK get the same defaults (limit, court, includeFullText).

/** For a process that doesn't run index.ts: initializes the same firebase-admin these queries use. */
export function initFirestore() {
  if (!admin.apps.length) admin.initializeApp()
}

export async function searchBills(args: unknown) {
  const {
    query,
    limit,
    court,
    legislationType,
    topic,
    committee,
    primarySponsor,
    includeFullText
  } = z.object(SearchSchema).parse(args)
  const embedding = await getEmbedding(query, true)
  const hasPostFilters = !!(
    legislationType ||
    topic ||
    committee ||
    primarySponsor
  )
  const fetchLimit = hasPostFilters ? Math.min(limit * 4, 100) : limit

  // Scope to a specific court by querying the collection path directly —
  // bills live at generalCourts/{court}/bills/{id}, so this is a true
  // pre-filter with no composite index required.
  const billsRef = getDb().collection(`generalCourts/${court}/bills`)

  const results = await (billsRef as any)
    .findNearest({
      vectorField: "vector_embedding",
      queryVector: embedding,
      distanceMeasure: "COSINE",
      distanceResultField: "distance",
      limit: fetchLimit
    })
    .get()

  return applyBillPostFilters(results.docs, {
    legislationType,
    topic,
    committee,
    primarySponsor
  })
    .slice(0, limit)
    .map((doc: any) => shapeBill(doc, includeFullText))
}

export async function searchTestimony(args: unknown) {
  const {
    query,
    court,
    policyType,
    policyId,
    authorDisplayName,
    limit,
    includeFullText
  } = z.object(TestimonySearchSchema).parse(args)
  const embedding = await getEmbedding(query, true)
  let testimonyRef: any = getDb().collectionGroup("publishedTestimony")
  let courtPostFilter = false

  if (policyType === "bill" && policyId) {
    // Uses existing billId + vector composite index; add court as post-filter
    testimonyRef = testimonyRef.where("billId", "==", policyId)
    courtPostFilter = true
  } else if (policyType === "ballot" && policyId) {
    // Uses existing ballotQuestionId + vector composite index; add court as post-filter
    testimonyRef = testimonyRef.where("ballotQuestionId", "==", policyId)
    courtPostFilter = true
  } else if (authorDisplayName) {
    // Author filter is gated on public === true to respect privacy preferences;
    // court added as post-filter to avoid a 3-field composite index
    testimonyRef = testimonyRef
      .where("authorDisplayName", "==", authorDisplayName)
      .where("public", "==", true)
    courtPostFilter = true
  } else {
    // General search: pre-filter by court using the court + vector composite index
    testimonyRef = testimonyRef.where("court", "==", court)
  }

  const fetchLimit = courtPostFilter ? Math.min(limit * 3, 100) : limit

  const results = await testimonyRef
    .findNearest({
      vectorField: "vector_embedding",
      queryVector: embedding,
      distanceMeasure: "COSINE",
      distanceResultField: "distance",
      limit: fetchLimit
    })
    .get()

  let docs: any[] = results.docs
  if (courtPostFilter) {
    docs = docs.filter((doc: any) => doc.data().court === court).slice(0, limit)
  }

  return docs.map((doc: any) => shapeTestimony(doc, includeFullText))
}

export async function listSponsors(args: unknown) {
  const { court } = z.object(ListSchema).parse(args)
  const snapshot = await getDb()
    .collection(`generalCourts/${court}/bills`)
    .limit(1000)
    .get()

  const sponsors = new Set<string>()
  snapshot.docs.forEach((doc: any) => {
    const name = doc.data().content?.PrimarySponsor?.Name
    if (name) sponsors.add(name)
  })
  return [...sponsors].sort()
}
