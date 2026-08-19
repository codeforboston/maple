import { Script } from "./types"
import { FieldValue } from "functions/src/firebase"
import { PredictionServiceClient, helpers } from "@google-cloud/aiplatform"

const location = "us-central1"
const publisher = "google"
const model = "text-embedding-005"
const CONCURRENCY = 8
const MAX_RETRIES = 6
const BACKOFF_BASE_MS = 1000

async function getEmbeddingWithRetry(
  client: PredictionServiceClient,
  endpoint: string,
  text: string,
  title?: string
): Promise<number[]> {
  const formattedText = `title: ${title || "none"} | text: ${text}`
  const instance = helpers.toValue({ content: formattedText })!
  const parameters = helpers.toValue({ outputDimensionality: 768 })!

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const responseArray = (await client.predict({
        endpoint,
        instances: [instance],
        parameters
      })) as any
      const response = responseArray[0]

      if (!response.predictions || response.predictions.length === 0) {
        throw new Error("No predictions returned from Vertex AI")
      }

      const prediction = helpers.fromValue(
        response.predictions[0] as any
      ) as any
      const embedding =
        prediction.embeddings?.values || prediction.embedding?.values

      if (!embedding) {
        throw new Error(
          `Unexpected prediction format: ${JSON.stringify(prediction)}`
        )
      }

      return embedding
    } catch (e: any) {
      const isQuotaError =
        e?.code === 8 ||
        e?.details?.includes("RESOURCE_EXHAUSTED") ||
        e?.message?.includes("RESOURCE_EXHAUSTED")
      if (isQuotaError && attempt < MAX_RETRIES) {
        const delay =
          BACKOFF_BASE_MS * Math.pow(2, attempt) + Math.random() * 500
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      throw e
    }
  }
  throw new Error("Max retries exceeded")
}

/** Run tasks with a fixed concurrency limit. */
async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<void> {
  const queue = [...tasks]
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const task = queue.shift()
      if (task) await task()
    }
  })
  await Promise.all(workers)
}

export const script: Script = async ({ db, args }) => {
  const project = process.env.GCLOUD_PROJECT
  const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`
  const client = new PredictionServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`
  })

  console.log(`Starting parallel backfill for project: ${project}`)
  console.log(`Concurrency: ${CONCURRENCY}`)

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

  const limitVal = (args as any).limit ?? (args as any).l ?? undefined
  const limit =
    typeof limitVal === "number"
      ? limitVal
      : typeof limitVal === "string"
      ? parseInt(limitVal, 10)
      : undefined

  for (const col of collections) {
    console.log(`\nProcessing collection: ${col.name}`)
    let query: any = col.group
      ? db.collectionGroup(col.name)
      : db.collection(col.name)

    if (limit) {
      console.log(`Limiting to ${limit} documents`)
      query = query.limit(limit)
    }

    const snapshot = await query.get()
    console.log(`Found ${snapshot.size} documents`)

    // Filter to only docs that need embeddings
    const docsToProcess = snapshot.docs.filter((doc: any) => {
      const existing = doc.data().vector_embedding
      return !(existing && typeof (existing as any).toArray === "function")
    })

    console.log(
      `${docsToProcess.length} need embeddings, ${
        snapshot.size - docsToProcess.length
      } already indexed`
    )

    const bulkWriter = db.bulkWriter()
    let done = 0
    let failed = 0
    const startTime = Date.now()

    const tasks = docsToProcess.map((doc: any) => async () => {
      const data = doc.data()

      const textToEmbed = col.textFields
        .map((field: string) => {
          const parts = field.split(".")
          let val: any = data
          for (const part of parts) val = val?.[part]
          return val
        })
        .filter(Boolean)
        .join("\n\n")

      if (!textToEmbed) {
        done++
        return
      }

      let title = "none"
      if (col.name === "bills") title = data.content?.Title || "none"
      else if (col.name === "ballotQuestions") title = data.title || "none"
      else if (col.name === "publishedTestimony")
        title = data.billTitle || "none"

      try {
        const embedding = await getEmbeddingWithRetry(
          client,
          endpoint,
          textToEmbed,
          title
        )
        bulkWriter.update(doc.ref, {
          vector_embedding: (FieldValue as any).vector(embedding)
        })
        done++

        if (done % 100 === 0 || done === docsToProcess.length) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
          const rate = (done / ((Date.now() - startTime) / 1000)).toFixed(1)
          const eta = Math.round(
            (docsToProcess.length - done) / parseFloat(rate)
          )
          console.log(
            `  ${done}/${docsToProcess.length} done | ${failed} failed | ${rate} docs/s | ETA ${eta}s | elapsed ${elapsed}s`
          )
        }
      } catch (e) {
        console.error(`  Failed ${doc.id}:`, e)
        failed++
        done++
      }
    })

    await runWithConcurrency(tasks, CONCURRENCY)
    await bulkWriter.close()

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(
      `Done with ${col.name}: ${
        done - failed
      } updated, ${failed} failed, in ${elapsed}s`
    )
  }

  console.log("\nBackfill complete!")
}
