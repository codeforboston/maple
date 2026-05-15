import { runWith } from "firebase-functions"
import * as admin from "firebase-admin"
import { PredictionServiceClient, helpers } from "@google-cloud/aiplatform"
import hash from "object-hash"

export interface VectorIndexerConfig {
  documentTrigger: string
  textFields: string[] // Fields to combine for the embedding
  vectorField: string // Destination field for the embedding (e.g., 'vector_embedding')
  titleField?: string // Optional field to use as the title for prefixing
}

export function createVectorIndexer(config: VectorIndexerConfig) {
  const location = "us-central1"
  const publisher = "google"
  const model = "gemini-embedding-2"

  return runWith({
    timeoutSeconds: 60,
    memory: "512MB",
    secrets: ["GOOGLE_APPLICATION_CREDENTIALS"] // If needed, though usually automatic on GCP
  })
    .firestore.document(config.documentTrigger)
    .onWrite(async change => {
      const data = change.after.exists ? change.after.data() : null
      if (!data) return // Deleted

      // Extract text to embed
      const textToEmbed = config.textFields
        .map(field => {
          const parts = field.split(".")
          let val: any = data
          for (const part of parts) val = val?.[part]
          return val
        })
        .filter(Boolean)
        .join("\n\n")

      if (!textToEmbed) return

      // Extract title for gemini-embedding-2 prefixing
      let title = "none"
      if (config.titleField) {
        const parts = config.titleField.split(".")
        let val: any = data
        for (const part of parts) val = val?.[part]
        title = val || "none"
      }

      // Check if text has changed to avoid redundant API calls
      const textHash = hash({ textToEmbed, title })
      const previousHash = (
        change.before.exists ? change.before.data() : null
      )?.[`${config.vectorField}_hash`]

      if (textHash === previousHash && data[config.vectorField]) {
        return // Nothing changed
      }

      // Initialize Vertex AI client
      const project = admin.app().options.projectId
      const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`
      const client = new PredictionServiceClient({
        apiEndpoint: `${location}-aiplatform.googleapis.com`
      })

      // Get embedding with multimodal/task prefix
      const formattedText = `title: ${title} | text: ${textToEmbed}`
      const instance = helpers.toValue({ content: formattedText })!
      const responseArray = (await client.predict({
        endpoint,
        instances: [instance]
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

      // Update document
      await change.after.ref.update({
        [config.vectorField]: embedding,
        [`${config.vectorField}_hash`]: textHash // Store hash to track changes
      })
    })
}
