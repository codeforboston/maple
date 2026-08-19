import { PredictionServiceClient, helpers } from "@google-cloud/aiplatform"
import { app } from "../firebase"

const LOCATION = "us-central1"
const PUBLISHER = "google"
const MODEL = "text-embedding-005"
export const EMBEDDING_DIMENSION = 768

let client: PredictionServiceClient | undefined

function getClient(): PredictionServiceClient {
  if (!client) {
    client = new PredictionServiceClient({
      apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`
    })
  }
  return client
}

/**
 * Embeds text with Vertex AI text-embedding-005 (768 dimensions). Shared by
 * the Firestore vector indexers (search/createVectorIndexer.ts) and the
 * ReAct agent's retrieval tools so query-time and index-time embeddings stay
 * in the same vector space.
 */
export async function embedText(
  text: string,
  title = "none"
): Promise<number[]> {
  const project = app.options.projectId
  const endpoint = `projects/${project}/locations/${LOCATION}/publishers/${PUBLISHER}/models/${MODEL}`

  const formattedText = `title: ${title} | text: ${text}`
  const instance = helpers.toValue({ content: formattedText })!
  const parameters = helpers.toValue({
    outputDimensionality: EMBEDDING_DIMENSION
  })!
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
  const embedding = prediction.embeddings?.values || prediction.embedding?.values

  if (!embedding) {
    throw new Error(`Unexpected prediction format: ${JSON.stringify(prediction)}`)
  }

  return embedding
}
