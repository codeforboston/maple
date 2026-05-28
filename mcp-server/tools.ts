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

const SearchSchema = {
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
  includeFullText: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Include full testimony text in results. Omit to receive a 300-character preview instead."
    )
}

const ListSchema = {
  court: z
    .number()
    .optional()
    .describe(
      "Legislature court session number (e.g. 193 for the current 2023-2024 session). Omit to search across all sessions."
    )
}

// ---------------------------------------------------------------------------
// Post-filter helper
// ---------------------------------------------------------------------------

/**
 * When metadata filters are active, fetch a larger candidate set from vector
 * search and apply the filters in-process before slicing to `limit`.
 */
function applyBillPostFilters(
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
// Tool registration
// ---------------------------------------------------------------------------

export function registerTools(server: McpServer) {
  // -------------------------------------------------------------------------
  // search_bills
  // -------------------------------------------------------------------------
  server.registerTool(
    "search_bills",
    {
      description:
        "Search legislative bills using natural language. Returns compact summaries by default; use includeFullText for statutory language. Narrow results with legislationType, topic, committee, or primarySponsor filters.",
      inputSchema: SearchSchema
    },
    async ({
      query,
      limit,
      legislationType,
      topic,
      committee,
      primarySponsor,
      includeFullText
    }: any) => {
      const embedding = await getEmbedding(query as string, true)
      const hasPostFilters = !!(topic || committee || primarySponsor)
      const fetchLimit = hasPostFilters
        ? Math.min((limit as number) * 4, 100)
        : (limit as number)

      const results = await (getDb().collectionGroup("bills") as any)
        .findNearest({
          vectorField: "vector_embedding",
          queryVector: embedding,
          distanceMeasure: "COSINE",
          distanceResultField: "distance",
          limit: fetchLimit
        })
        .get()

      const filtered = applyBillPostFilters(results.docs, {
        legislationType,
        topic,
        committee,
        primarySponsor
      }).slice(0, limit as number)

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              filtered.map((doc: any) => shapeBill(doc, includeFullText)),
              null,
              2
            )
          }
        ]
      }
    }
  )

  // -------------------------------------------------------------------------
  // search_testimony
  // -------------------------------------------------------------------------
  server.registerTool(
    "search_testimony",
    {
      description:
        "Search testimony using natural language. Returns relevanceScore, author info (anonymized for private-profile users), position, and a content preview by default; use includeFullText for the full text. Filter to a specific bill or ballot question with policyType + policyId. Filter by authorDisplayName to find testimony from a specific public user.",
      inputSchema: TestimonySearchSchema
    },
    async ({
      query,
      policyType,
      policyId,
      authorDisplayName,
      limit,
      includeFullText
    }: any) => {
      const embedding = await getEmbedding(query as string, true)
      let testimonyRef: any = getDb().collectionGroup("publishedTestimony")

      if (policyType === "bill" && policyId) {
        testimonyRef = testimonyRef.where("billId", "==", policyId)
      } else if (policyType === "ballot" && policyId) {
        testimonyRef = testimonyRef.where("ballotQuestionId", "==", policyId)
      }

      // Author filter is gated on public === true to respect privacy preferences
      if (authorDisplayName) {
        testimonyRef = testimonyRef
          .where("authorDisplayName", "==", authorDisplayName)
          .where("public", "==", true)
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

  // -------------------------------------------------------------------------
  // search_ballot_questions
  // -------------------------------------------------------------------------
  server.registerTool(
    "search_ballot_questions",
    {
      description:
        "Search ballot questions using natural language. Returns compact summaries by default; use includeFullText for full question text.",
      inputSchema: {
        query: z.string().describe("The search query"),
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
            "Include full question text in results. Omit to receive a compact summary."
          )
      }
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

  // -------------------------------------------------------------------------
  // search_policies
  // -------------------------------------------------------------------------
  server.registerTool(
    "search_policies",
    {
      description:
        "Unified search across bills and ballot questions, deduplicated and sorted by relevance. Returns compact summaries by default; use includeFullText for full statutory/question text. Supports the same topic, committee, and primarySponsor filters as search_bills.",
      inputSchema: SearchSchema
    },
    async ({
      query,
      limit,
      legislationType,
      topic,
      committee,
      primarySponsor,
      includeFullText
    }: any) => {
      const embedding = await getEmbedding(query as string, true)
      const hasPostFilters = !!(topic || committee || primarySponsor)
      const fetchLimit = hasPostFilters
        ? Math.min((limit as number) * 4, 100)
        : (limit as number)

      const billsPromise = (getDb().collectionGroup("bills") as any)
        .findNearest({
          vectorField: "vector_embedding",
          queryVector: embedding,
          distanceMeasure: "COSINE",
          distanceResultField: "distance",
          limit: fetchLimit
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

      const filteredBillDocs = applyBillPostFilters(
        (billsResults as any).docs,
        { legislationType, topic, committee, primarySponsor }
      ).slice(0, limit as number)

      const shapedBills = filteredBillDocs.map((doc: any) => ({
        type: "bill" as const,
        ...shapeBill(doc, includeFullText as boolean)
      }))

      const shapedBallotQuestions = (bqResults as any).docs.map((doc: any) =>
        shapeBallotQuestion(doc, includeFullText as boolean)
      )

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

  // -------------------------------------------------------------------------
  // list_topics
  // -------------------------------------------------------------------------
  server.registerTool(
    "list_topics",
    {
      description:
        "Returns all valid AI-assigned topic tags, grouped by broad category. Each bill is tagged with one or more fine-grained topics (e.g. 'Water quality', 'Mental health') by an LLM at publication time. Pass any topic string to the topic filter in search_bills or search_policies.",
      inputSchema: {}
    },
    async () => {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(TOPICS_BY_CATEGORY, null, 2)
          }
        ]
      }
    }
  )

  // -------------------------------------------------------------------------
  // list_committees
  // -------------------------------------------------------------------------
  server.registerTool(
    "list_committees",
    {
      description:
        "Returns the names of all active committees currently holding bills, optionally filtered by court session. Use the returned names as the committee filter in search_bills.",
      inputSchema: ListSchema
    },
    async ({ court }: any) => {
      let query: any = getDb().collectionGroup("bills")
      if (court) query = query.where("court", "==", court)
      const snapshot = await query.limit(1000).get()

      const committees = new Set<string>()
      snapshot.docs.forEach((doc: any) => {
        const name = doc.data().currentCommittee?.name
        if (name) committees.add(name)
      })

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify([...committees].sort(), null, 2)
          }
        ]
      }
    }
  )

  // -------------------------------------------------------------------------
  // list_sponsors
  // -------------------------------------------------------------------------
  server.registerTool(
    "list_sponsors",
    {
      description:
        "Returns the names of all primary sponsors who have filed bills, optionally filtered by court session. Use the returned names as the primarySponsor filter in search_bills.",
      inputSchema: ListSchema
    },
    async ({ court }: any) => {
      let query: any = getDb().collectionGroup("bills")
      if (court) query = query.where("court", "==", court)
      const snapshot = await query.limit(1000).get()

      const sponsors = new Set<string>()
      snapshot.docs.forEach((doc: any) => {
        const name = doc.data().content?.PrimarySponsor?.Name
        if (name) sponsors.add(name)
      })

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify([...sponsors].sort(), null, 2)
          }
        ]
      }
    }
  )
}

// ---------------------------------------------------------------------------
// Static topic taxonomy (mirrors TOPICS_BY_CATEGORY in functions/src/bills/types.ts)
// ---------------------------------------------------------------------------

const TOPICS_BY_CATEGORY: Record<string, string[]> = {
  Commerce: [
    "Banking and financial institutions regulation",
    "Consumer protection",
    "Corporation law and goverance",
    "Commercial insurance",
    "Marketing and advertising",
    "Non-profit law and governance",
    "Occupational licensing",
    "Partnerships and limited liability companies",
    "Retail and wholesale trades",
    "Securities"
  ],
  "Crime and Law Enforcement": [
    "Assault and harassment offenses",
    "Correctional facilities",
    "Crimes against animals and natural resources",
    "Crimes against children",
    "Criminal investigation, prosecution, interrogation",
    "Criminal justice information and records",
    "Criminal justice reform",
    "Criminal sentencing",
    "Firearms and explosives",
    "Fraud offenses and financial crimes",
    "Property crimes"
  ],
  "Economics and Public Finance": [
    "Budget process",
    "Debt collection",
    "Eminent domain",
    "Financial literacy",
    "Financial services and investments",
    "Government contractors",
    "Pension and retirement benefits"
  ],
  Education: [
    "Academic performance and assessments",
    "Adult education and literacy",
    "Charter and private schools",
    "Curriculum and standards",
    "Education technology",
    "Educational facilities and institutions",
    "Elementary and secondary education",
    "Higher education",
    "Special education",
    "Student aid and college costs",
    "Teachers and educators",
    "Vocational and technical education"
  ],
  "Emergency Management": [
    "Disaster relief and insurance",
    "Emergency communications systems",
    "Emergency medical services and trauma care",
    "Emergency planning and evacuation",
    "Hazards and emergency operations"
  ],
  Energy: [
    "Energy costs assistance",
    "Energy efficiency and conservation",
    "Energy infrastructure and storage",
    "Energy prices and subsidies",
    "Energy research",
    "Renewable energy sources"
  ],
  "Environmental Protection": [
    "Air quality",
    "Environmental assessment, monitoring, research",
    "Environmental education",
    "Environmental health",
    "Environmental regulatory procedures",
    "Hazardous wastes and toxic substances",
    "Pollution control and abatement",
    "Soil pollution",
    "Trash and recycling",
    "Water quality",
    "Wetlands",
    "Wildlife conservation"
  ],
  Families: [
    "Adoption and foster care",
    "Family planning and birth control",
    "Family relationships and status",
    "Family services",
    "Life insurance",
    "Parenting and parental rights"
  ],
  "Food, Drugs, and Alcohol": [
    "Alcoholic beverages and licenses",
    "Drug, alcohol, tobacco use",
    "Drug safety, medical device, and laboratory regulation",
    "Food industry and services",
    "Food service employment",
    "Food supply, safety, and labeling",
    "Nutrition and diet"
  ],
  "Government Operations and Elections": [
    "Census and government statistics",
    "Government information and archives",
    "Government studies and investigations",
    "Government trust funds",
    "Lobbying and campaign finance",
    'Municipality oversight and "home rule petitions"',
    "Political advertising",
    "Public-private partnerships",
    "Voting and elections"
  ],
  Healthcare: [
    "Alternative treatments",
    "Dental care",
    "Health care costs",
    "Health facilities and institutions",
    "Health information and medical records",
    "Health insurance and coverage",
    "Health technology, devices, supplies",
    "Healthcare workforce",
    "Medical research",
    "Mental health",
    "Prescription drugs",
    "Sex and reproductive health",
    "Substance use disorder and addiction",
    "Telehealth",
    "Veterinary services and pets"
  ],
  "Housing and Community Development": [
    "Community life and organization",
    "Cooperative and condominium housing",
    "Homelessness and emergency shelter",
    "Housing discrimination",
    "Housing finance and home ownership",
    "Housing for the elderly and disabled",
    "Housing industry and standards",
    "Housing supply and affordability",
    "Landlord and tenant",
    "Low- and moderate-income housing",
    "Residential rehabilitation and home repair"
  ],
  "Immigrants and Foreign Nationals": [
    "Immigrant health and welfare",
    "Refugees, asylum, displaced persons",
    "Right to shelter",
    "Translation and language services"
  ],
  "Labor and Employment": [
    "Employee benefits",
    "Employment discrimination",
    "Employee leave",
    "Employee pensions",
    "Employee performance",
    "Migrant, seasonal, agricultural labor",
    "Self-employment",
    "Temporary and part-time employment",
    "Workers' compensation",
    "Workforce development and employment training",
    "Worker safety and health",
    "Youth employment and child labor"
  ],
  "Law and Judiciary": [
    "Civil disturbances",
    "Evidence and witnesses",
    "Judicial and court records",
    "Judicial review and appeals",
    "Jurisdiction and venue",
    "Legal fees and court costs"
  ],
  "Public and Natural Resources": [
    "Agriculture and aquaculture",
    "Coastal zones and ocean",
    "Forests, forestry, trees",
    "Monuments and memorials",
    "Watershed and water resources",
    "Wildlife"
  ],
  "Social Services": [
    "Child care and development",
    "Domestic violence and child abuse",
    "Food assistance and relief",
    "Home and outpatient care",
    "Social work, volunteer service, charitable organizations",
    "Unemployment",
    "Urban and suburban affairs and development",
    "Veterans' education, employment, rehabilitation",
    "Veterans' loans, housing, homeless programs",
    "Veterans' medical care"
  ],
  "Sports and Recreation": [
    "Art and culture",
    "Gambling and lottery",
    "Hunting and fishing",
    "Outdoor recreation",
    "Professional sports, stadiums and arenas",
    "Public parks",
    "Sports and recreation facilities"
  ],
  Taxation: [
    "Capital gains tax",
    "Corporate tax",
    "Estate tax",
    "Excise tax",
    "Gift tax",
    "Income tax",
    "Payroll and emplyoment tax",
    "Property tax",
    "Sales tax",
    "Tax-exempt organizations",
    "Transfer and inheritance taxes"
  ],
  "Technology and Communications": [
    "Advanced technology and technological innovations",
    "Atmospheric science and weather",
    "Broadband and internet access",
    "Computers and information technology",
    "Cybersecurity and identity theft",
    "Data privacy",
    "Emerging technology (artificial intelligence, blockchain, etc.)",
    "Genetics",
    "Internet, web applications, social media",
    "Photography and imaging",
    "Telecommunication rates and fees",
    "Telephone and wireless communication"
  ],
  "Transportation and Public Works": [
    "Aviation and airports",
    "Highways and roads",
    "MBTA & public transportation",
    "Public utilities and utility rates",
    "Railroads",
    "Vehicle insurance and repairs",
    "Water storage",
    "Water use and supply"
  ]
}
