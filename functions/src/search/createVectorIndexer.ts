import { runWith } from "firebase-functions"
import { FieldValue } from "firebase-admin/firestore"
import hash from "object-hash"
import { embedText } from "../llm/embeddings"

export interface VectorIndexerConfig {
  documentTrigger: string
  textFields: string[] // Fields to combine for the embedding
  vectorField: string // Destination field for the embedding (e.g., 'vector_embedding')
  titleField?: string // Optional field to use as the title for prefixing
}

export function createVectorIndexer(config: VectorIndexerConfig) {
  return runWith({
    timeoutSeconds: 60,
    memory: "512MB"
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

      const embedding = await embedText(textToEmbed, title)

      // Update document. The embedding must be stored as a Firestore
      // VectorValue (not a plain array) for the vector index / findNearest to
      // pick it up. The direct @google-cloud/firestore dep is pinned at v5,
      // whose typings predate vector(); at runtime the firebase-admin v12
      // bundled firestore (v7) provides it. Cast to bridge the type gap.
      const fieldValue = FieldValue as unknown as {
        vector(values: number[]): unknown
      }
      await change.after.ref.update({
        [config.vectorField]: fieldValue.vector(embedding),
        [`${config.vectorField}_hash`]: textHash // Store hash to track changes
      })
    })
}
