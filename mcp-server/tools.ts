import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import * as admin from "firebase-admin"
import { PredictionServiceClient, helpers } from "@google-cloud/aiplatform"

// Initialize Firebase Admin (assume it's already initialized or will be in index.ts)
const db = admin.firestore()

// Vertex AI Configuration
const project = process.env.FIREBASE_PROJECT_ID
const location = "us-central1"
const publisher = "google"
const model = "gemini-embedding-2"
const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`

const client = new PredictionServiceClient({
  apiEndpoint: `${location}-aiplatform.googleapis.com`
})

async function getEmbedding(
  text: string,
  isQuery: boolean,
  title?: string
): Promise<number[]> {
  const formattedText = isQuery
    ? `task: search result | query: ${text}`
    : `title: ${title || "none"} | text: ${text}`

  const instance = helpers.toValue({ content: formattedText })!
  const responseArray = (await client.predict({
    endpoint,
    instances: [instance]
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

const SearchSchema = {
  query: z.string().describe("The search query"),
  limit: z
    .number()
    .optional()
    .default(5)
    .describe("Maximum number of results to return")
}

const TestimonySearchSchema = {
  query: z.string().describe("The search query"),
  policyType: z
    .enum(["bill", "ballot"])
    .optional()
    .describe("Filter by policy type"),
  policyId: z.string().optional().describe("Filter by specific policy ID"),
  limit: z.number().optional().default(5)
}

export function registerTools(server: McpServer) {
  server.registerTool(
    "search_bills",
    {
      description: "Search legislative bills using natural language",
      inputSchema: SearchSchema as any
    },
    async ({ query, limit }: any) => {
      const embedding = await getEmbedding(query as string, true)
      const billsRef = db.collectionGroup("bills")

      const results = await (billsRef as any)
        .findNearest({
          vectorField: "vector_embedding",
          queryVector: embedding,
          distanceMeasure: "COSINE",
          limit: limit as number
        })
        .get()

      const bills = results.docs.map((doc: any) => ({
        id: doc.id,
        path: doc.ref.path,
        ...doc.data(),
        vector_embedding: undefined // Hide embedding from output
      }))

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
      description: "Search testimony using natural language",
      inputSchema: TestimonySearchSchema as any
    },
    async ({ query, policyType, policyId, limit }: any) => {
      const embedding = await getEmbedding(query as string, true)
      let testimonyRef: any = db.collectionGroup("publishedTestimony")

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
          limit: limit as number
        })
        .get()

      const testimony = results.docs.map((doc: any) => ({
        id: doc.id,
        path: doc.ref.path,
        ...doc.data(),
        vector_embedding: undefined
      }))

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
      description: "Search ballot questions using natural language",
      inputSchema: SearchSchema as any
    },
    async ({ query, limit }: any) => {
      const embedding = await getEmbedding(query as string, true)
      const bqRef = db.collection("ballotQuestions")

      const results = await (bqRef as any)
        .findNearest({
          vectorField: "vector_embedding",
          queryVector: embedding,
          distanceMeasure: "COSINE",
          limit: limit as number
        })
        .get()

      const questions = results.docs.map((doc: any) => ({
        id: doc.id,
        path: doc.ref.path,
        ...doc.data(),
        vector_embedding: undefined
      }))

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
      description: "Unified search across bills and ballot questions",
      inputSchema: SearchSchema as any
    },
    async ({ query, limit }: any) => {
      const embedding = await getEmbedding(query as string, true)

      const billsPromise = (db.collectionGroup("bills") as any)
        .findNearest({
          vectorField: "vector_embedding",
          queryVector: embedding,
          distanceMeasure: "COSINE",
          limit: limit as number
        })
        .get()

      const bqPromise = (db.collection("ballotQuestions") as any)
        .findNearest({
          vectorField: "vector_embedding",
          queryVector: embedding,
          distanceMeasure: "COSINE",
          limit: limit as number
        })
        .get()

      const [billsResults, bqResults] = await Promise.all([
        billsPromise,
        bqPromise
      ])

      const results = [
        ...(billsResults as any).docs.map((doc: any) => ({
          type: "bill",
          id: doc.id,
          ...doc.data(),
          vector_embedding: undefined
        })),
        ...(bqResults as any).docs.map((doc: any) => ({
          type: "ballot_question",
          id: doc.id,
          ...doc.data(),
          vector_embedding: undefined
        }))
      ]

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              results.slice(0, (limit as number) * 2),
              null,
              2
            )
          }
        ]
      }
    }
  )
}
