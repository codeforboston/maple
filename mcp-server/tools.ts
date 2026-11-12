import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  ListSchema,
  SearchSchema,
  TestimonySearchSchema,
  applyBillPostFilters,
  getDb,
  getEmbedding,
  listSponsors,
  searchBills,
  searchTestimony,
  shapeBallotQuestion,
  shapeBill
} from "./queries"

export { shapeBill, shapeTestimony, shapeBallotQuestion } from "./queries"

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
        "Search legislative bills using natural language. Returns compact summaries by default; use includeFullText for statutory language. Defaults to the current General Court session. Narrow results with legislationType, topic, committee, or primarySponsor filters.",
      inputSchema: SearchSchema
    },
    async (args: any) => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(await searchBills(args), null, 2)
        }
      ]
    })
  )

  // -------------------------------------------------------------------------
  // search_testimony
  // -------------------------------------------------------------------------
  server.registerTool(
    "search_testimony",
    {
      description:
        "Search testimony using natural language. Returns relevanceScore, author info (anonymized for private-profile users), position, and a content preview by default; use includeFullText for the full text. Defaults to the current General Court session. Filter to a specific bill or ballot question with policyType + policyId. Filter by authorDisplayName to find testimony from a specific public user.",
      inputSchema: TestimonySearchSchema
    },
    async (args: any) => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(await searchTestimony(args), null, 2)
        }
      ]
    })
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
        "Unified search across bills and ballot questions, sorted by relevance. Returns compact summaries by default; use includeFullText for full statutory/question text. Defaults to the current General Court session for bills. Supports the same topic, committee, and primarySponsor filters as search_bills.",
      inputSchema: SearchSchema
    },
    async ({
      query,
      limit,
      court,
      legislationType,
      topic,
      committee,
      primarySponsor,
      includeFullText
    }: any) => {
      const embedding = await getEmbedding(query as string, true)
      const hasPostFilters = !!(
        legislationType ||
        topic ||
        committee ||
        primarySponsor
      )
      const fetchLimit = hasPostFilters
        ? Math.min((limit as number) * 4, 100)
        : (limit as number)

      // Bills: scope to specific court via collection path (no composite index needed)
      const billsPromise = (
        getDb().collection(`generalCourts/${court}/bills`) as any
      )
        .findNearest({
          vectorField: "vector_embedding",
          queryVector: embedding,
          distanceMeasure: "COSINE",
          distanceResultField: "distance",
          limit: fetchLimit
        })
        .get()

      // Ballot questions are not organised by GC court — search across all
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

      // Bills (H1234) and ballot questions (25-12) have structurally distinct IDs —
      // no deduplication needed; just merge and sort by relevance.
      const merged = [...shapedBills, ...shapedBallotQuestions]
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
      const snapshot = await getDb()
        .collection(`generalCourts/${court}/bills`)
        .limit(1000)
        .get()

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
    async (args: any) => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(await listSponsors(args), null, 2)
        }
      ]
    })
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
