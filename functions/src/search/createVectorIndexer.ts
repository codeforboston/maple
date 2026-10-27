import { onDocumentWritten } from "firebase-functions/v2/firestore"
import * as admin from "firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import type { PredictionServiceClient } from "@google-cloud/aiplatform"
import hash from "object-hash"

export interface VectorIndexerConfig {
  documentTrigger: string
  textFields: string[] // Fields to combine for the embedding
  vectorField: string // Destination field for the embedding (e.g., 'vector_embedding')
  titleField?: string // Optional field to use as the title for prefixing
}

const location = "us-central1"
const publisher = "google"
const model = "text-embedding-005"

const pick = (data: any, path: string) =>
  path.split(".").reduce((val, part) => val?.[part], data)

/** The text, title and change-tracking hash to embed for a document, or null
 * if it has no text. */
export function embeddingInput(config: VectorIndexerConfig, data: any) {
  const text = config.textFields
    .map(field => pick(data, field))
    .filter(Boolean)
    .join("\n\n")
  if (!text) return null
  // Title used as the embedding prefix
  const title: string =
    (config.titleField && pick(data, config.titleField)) || "none"
  return { text, title, hash: hash({ textToEmbed: text, title }) }
}

let aiplatform: Promise<typeof import("@google-cloud/aiplatform")> | undefined
let client: PredictionServiceClient | undefined

/** Embed text with Vertex AI. The client is loaded on first use rather than at
 * import: every function shares one bundle, and loading it at import pushed
 * each one past its default 256 MiB memory limit, so none could start. */
export async function getEmbedding(
  project: string,
  text: string,
  title: string
): Promise<number[]> {
  const { PredictionServiceClient, helpers } = await (aiplatform ??= import(
    "@google-cloud/aiplatform"
  ))
  client ??= new PredictionServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`
  })
  const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`

  // Get embedding with multimodal/task prefix
  const formattedText = `title: ${title} | text: ${text}`
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

/** The fields to write for an embedding. It must be stored as a Firestore
 * VectorValue (not a plain array) for the vector index / findNearest to pick
 * it up. The direct @google-cloud/firestore dep is pinned at v5, whose
 * typings predate vector(); at runtime the firebase-admin v12 bundled
 * firestore (v7) provides it. Cast to bridge the type gap. */
export function embeddingFields(
  config: VectorIndexerConfig,
  embedding: number[],
  textHash: string
): { [field: string]: any } {
  const fieldValue = FieldValue as unknown as {
    vector(values: number[]): unknown
  }
  return {
    [config.vectorField]: fieldValue.vector(embedding),
    [`${config.vectorField}_hash`]: textHash // Store hash to track changes
  }
}

export function createVectorIndexer(config: VectorIndexerConfig) {
  return onDocumentWritten(
    {
      document: config.documentTrigger,
      timeoutSeconds: 60,
      memory: "512MiB"
    },
    async event => {
      const change = event.data
      if (!change) return

      const data = change.after.exists ? change.after.data() : null
      if (!data) return // Deleted

      const input = embeddingInput(config, data)
      if (!input) return

      // Skip if the stored embedding already matches this text. Compare with
      // the hash on the written document, not the previous version: writing
      // the embedding fires this trigger again, and the previous version had
      // no hash yet, so comparing with it embedded every document twice.
      if (
        input.hash === data[`${config.vectorField}_hash`] &&
        data[config.vectorField]
      ) {
        return // Nothing changed
      }

      const project = admin.app().options.projectId!
      const embedding = await getEmbedding(project, input.text, input.title)
      await change.after.ref.update(
        embeddingFields(config, embedding, input.hash)
      )
    }
  )
}
