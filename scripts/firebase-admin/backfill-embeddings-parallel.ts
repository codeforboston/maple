import { Script } from "./types"
import {
  embeddingFields,
  embeddingInput,
  getEmbedding,
  VectorIndexerConfig
} from "functions/src/search/createVectorIndexer"
import {
  ballotQuestionVectorConfig,
  billVectorConfig,
  testimonyVectorConfig
} from "functions/src/search/vectorConfigs"

const PAGE_SIZE = 300
const CONCURRENCY = 8
const MAX_RETRIES = 6
const BACKOFF_BASE_MS = 1000

async function getEmbeddingWithRetry(
  project: string,
  text: string,
  title: string
): Promise<number[]> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await getEmbedding(project, text, title)
    } catch (e: any) {
      const isQuotaError =
        e?.code === 8 ||
        e?.details?.includes("RESOURCE_EXHAUSTED") ||
        e?.message?.includes("RESOURCE_EXHAUSTED")
      if (!isQuotaError || attempt >= MAX_RETRIES) throw e
      const delay = BACKOFF_BASE_MS * Math.pow(2, attempt) + Math.random() * 500
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

/**
 * Embed every document that has no embedding yet, writing the same fields the
 * vector-index triggers write (including the change-tracking hash, so the
 * triggers don't re-embed these documents on their next write).
 *
 * Pages through each collection reading only the embedding field: loading a
 * whole collection at once exceeds the Firestore query deadline on prod's
 * bills.
 *
 * Usage: yarn firebase-admin run-script backfill-embeddings-parallel --env dev
 */
export const script: Script = async ({ db }) => {
  const project = process.env.GCLOUD_PROJECT!
  console.log(`Embedding backfill for project: ${project}`)

  const collections: {
    name: string
    group: boolean
    config: VectorIndexerConfig
  }[] = [
    {
      name: "ballotQuestions",
      group: false,
      config: ballotQuestionVectorConfig
    },
    { name: "publishedTestimony", group: true, config: testimonyVectorConfig },
    { name: "bills", group: true, config: billVectorConfig }
  ]

  for (const { name, group, config } of collections) {
    const base = group ? db.collectionGroup(name) : db.collection(name)

    // Find documents missing an embedding, a page at a time.
    const missing: FirebaseFirestore.DocumentReference[] = []
    let scanned = 0
    let last: FirebaseFirestore.QueryDocumentSnapshot | undefined
    while (true) {
      let query = base
        .select(config.vectorField)
        .orderBy("__name__")
        .limit(PAGE_SIZE)
      if (last) query = query.startAfter(last)
      const page = await query.get()
      if (page.empty) break
      for (const doc of page.docs) {
        // Lobbying bill summaries share the "bills" collection group name.
        if (doc.ref.path.startsWith("lobbyingMeta/")) continue
        scanned++
        if (!doc.get(config.vectorField)) missing.push(doc.ref)
      }
      last = page.docs[page.docs.length - 1]
    }
    console.log(`\n${name}: scanned ${scanned}, missing ${missing.length}`)

    const writer = db.bulkWriter()
    let done = 0,
      embedded = 0,
      noText = 0,
      failed = 0
    const queue = [...missing]
    await Promise.all(
      Array.from({ length: CONCURRENCY }, async () => {
        while (queue.length) {
          const ref = queue.shift()!
          try {
            const input = embeddingInput(config, (await ref.get()).data())
            if (!input) {
              noText++
            } else {
              const embedding = await getEmbeddingWithRetry(
                project,
                input.text,
                input.title
              )
              writer.update(ref, embeddingFields(config, embedding, input.hash))
              embedded++
            }
          } catch (e: any) {
            failed++
            console.error(`  Failed ${ref.path}: ${e?.message ?? e}`)
          }
          if (++done % 100 === 0) console.log(`  ${done}/${missing.length}`)
        }
      })
    )
    await writer.close()
    console.log(
      `${name}: embedded ${embedded}, no text ${noText}, failed ${failed}`
    )
  }

  console.log("\nBackfill complete!")
}
