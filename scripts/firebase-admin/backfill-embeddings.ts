import { Script } from "./types"
import { PredictionServiceClient, helpers } from "@google-cloud/aiplatform"

const location = "us-central1"
const publisher = "google"
const model = "text-embedding-005"

async function getEmbedding(
  client: PredictionServiceClient,
  endpoint: string,
  text: string,
  title?: string
): Promise<number[]> {
  const formattedText = `title: ${title || "none"} | text: ${text}`
  const instance = helpers.toValue({ content: formattedText })!
  const parameters = helpers.toValue({ outputDimensionality: 768 })!
  const responseArray = (await client.predict({
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

export const script: Script = async ({ db, firebase, args }) => {
  const project = process.env.GCLOUD_PROJECT
  const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`
  const client = new PredictionServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`
  })

  console.log(`Starting backfill for project: ${project}`)

  const collections = [
    {
      name: "bills",
      group: true,
      textFields: ["content.Title", "content.DocumentText"]
    },
    { name: "publishedTestimony", group: true, textFields: ["content"] },
    {
      name: "ballotQuestions",
      group: false,
      textFields: ["title", "description", "fullSummary"]
    }
  ]

  for (const col of collections) {
    console.log(`Processing collection: ${col.name}`)
    let query: any = col.group
      ? db.collectionGroup(col.name)
      : db.collection(col.name)

    const limitVal = (args as any).limit ?? ((args as any).l ?? undefined)
    const limit = typeof limitVal === "number" ? limitVal : (typeof limitVal === "string" ? parseInt(limitVal, 10) : undefined)

    if (limit) {
      console.log(`Limiting retrieval to ${limit} documents`)
      query = query.limit(limit)
    }

    const snapshot = await query.get()

    console.log(`Found ${snapshot.size} documents in ${col.name}`)

    for (const doc of snapshot.docs) {
      const data = doc.data()
      if (data.vector_embedding) {
        console.log(`Skipping ${doc.id} (already indexed)`)
        continue
      }

      const textToEmbed = col.textFields
        .map(field => {
          const parts = field.split(".")
          let val = data
          for (const part of parts) val = val?.[part]
          return val
        })
        .filter(Boolean)
        .join("\n\n")

      if (!textToEmbed) {
        console.log(`Skipping ${doc.id} (no content)`)
        continue
      }

      // Extract title for gemini-embedding-2 prefixing
      let title = "none"
      if (col.name === "bills") title = data.content?.Title || "none"
      else if (col.name === "ballotQuestions") title = data.title || "none"
      else if (col.name === "publishedTestimony")
        title = data.billTitle || "none"

      try {
        console.log(`Generating embedding for ${doc.id}...`)
        const embedding = await getEmbedding(
          client,
          endpoint,
          textToEmbed,
          title
        )
        await doc.ref.update({ vector_embedding: embedding })
        console.log(`Updated ${doc.id}`)
      } catch (e) {
        console.error(`Failed to index ${doc.id}:`, e)
      }
    }
  }

  console.log("Backfill complete!")
}
