/** Builds a corpus from a live MAPLE project without any credentials.
 *
 * firestore.rules grants unauthenticated read on every collection a corpus is
 * built from — `events` and `generalCourts/**` are "public, read-only", and
 * publishedTestimony has an explicit `match /{path=**}/publishedTestimony/{id}`
 * rule so it can be read as a collection group. So the web client SDK reads it
 * with nothing but a project id, which is what makes every corpus reachable to
 * contributors who have no service account.
 *
 * Bills needs one extra step. Its rule is path-scoped to `generalCourts/**` and
 * does not grant collection-group scope, so `collectionGroup("bills")` is
 * denied — but `generalCourts/192/bills` is a plain collection read inside that
 * scope and is allowed. Substituting each general court for the trigger's
 * `{court}` wildcard turns the one denied read into three permitted ones.
 */
import { initializeApp } from "firebase/app"
import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp as ClientTimestamp,
  collection,
  collectionGroup,
  documentId,
  getDocs,
  getFirestore,
  limit as limitTo,
  orderBy,
  query,
  startAfter
} from "firebase/firestore"
// The very same Timestamp the converters' runtypes check against. Importing it
// from "firebase-admin/firestore" here instead resolves to the ROOT copy of the
// package while functions/src/firebase resolves to functions/node_modules — two
// distinct classes, and every InstanceOf check fails with the memorable
// "Expected Timestamp, but was Timestamp".
import { Timestamp as AdminTimestamp } from "../../functions/src/firebase"
import type { CollectionConfig } from "../../functions/src/search/config"
import { ExportedDoc } from "./corpusFiles"

export const projects = {
  dev: "digital-testimony-dev",
  prod: "digital-testimony-prod"
} as const

export type RemoteEnv = keyof typeof projects

const batchSize = 500

/** The converters validate timestamps with `InstanceOf(Timestamp)` against the
 * firebase-admin class (functions/src/testimony/types.ts:41,
 * functions/src/events/types.ts:33). The client SDK's Timestamp is a different
 * class, so every document fails validation unless it is rebuilt as the admin
 * one. Seconds and nanos are carried across rather than millis so nothing is
 * rounded away.
 */
const toAdminTypes = (value: unknown): unknown => {
  if (value instanceof ClientTimestamp)
    return new AdminTimestamp(value.seconds, value.nanoseconds)
  if (Array.isArray(value)) return value.map(toAdminTypes)
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        toAdminTypes(v)
      ])
    )
  return value
}

/** One readable Firestore source. For a collection group the collection id is
 * the path, so one field covers both.
 */
type RemoteSource = { path: string; isCollectionGroup?: boolean }

/** The sources to read, derived from the config's document trigger so they
 * cannot drift from the indexer's own source.
 *
 * - `events/{eventId}` is a top-level collection.
 * - `users/{uid}/publishedTestimony/{id}` is nested under a wildcard, so it is
 *   read as a collection group — permitted by its own `{path=**}` rule.
 * - `generalCourts/{court}/bills/{id}` is nested too, but no rule grants it
 *   group scope. `courts` is substituted for `{court}` to give one concrete,
 *   readable path per general court.
 *
 * Any `where` on config.sourceCollection is deliberately not reproduced —
 * config.filter is the authority on which documents belong in the index, and
 * it is applied to every document below.
 */
export function sourcesFromTrigger(
  documentTrigger: string,
  courts: readonly number[]
): RemoteSource[] {
  const segments = documentTrigger.split("/").filter(Boolean)
  if (segments.length < 2 || segments.length % 2 !== 0)
    throw Error(`Cannot read a collection out of trigger "${documentTrigger}"`)

  // Drop the trailing document-id wildcard; what remains is the collection.
  const path = segments.slice(0, -1)
  const collectionId = path[path.length - 1]

  if (path.length === 1) return [{ path: collectionId }]
  if (path.length === 3 && path[0] === "generalCourts")
    return courts.map(court => ({
      path: `generalCourts/${court}/${collectionId}`
    }))
  return [{ path: collectionId, isCollectionGroup: true }]
}

export async function fetchRemoteDocs({
  env,
  config,
  courts,
  limit,
  orderByField,
  direction,
  onProgress
}: {
  env: RemoteEnv
  config: CollectionConfig
  courts: readonly number[]
  limit?: number
  orderByField: string
  direction: "asc" | "desc"
  onProgress?: (fetched: number, kept: number) => void
}): Promise<{ docs: ExportedDoc[]; failures: number }> {
  const projectId = projects[env]
  const sources = sourcesFromTrigger(config.documentTrigger, courts)

  const app = initializeApp({ projectId }, `search-eval-${env}`)
  const db = getFirestore(app)

  const docs: ExportedDoc[] = []
  let failures = 0
  let fetched = 0

  // `limit` caps the corpus as a whole, not each source, so a capped export of
  // a multi-court collection is the first N documents overall.
  for (const source of sources) {
    const ref = source.isCollectionGroup
      ? collectionGroup(db, source.path)
      : collection(db, source.path)
    let cursor: QueryDocumentSnapshot<DocumentData> | undefined

    while (limit === undefined || docs.length < limit) {
      const page = query(
        ref,
        // Paging needs a total order, not a meaningful one: writeCorpus sorts
        // by id before writing, so this never reaches the corpus. "__name__"
        // is the default because document name is the one ordering Firestore
        // can always serve — prod carries a single-field index exemption on
        // bills' `id`, and ordering by it fails with failed-precondition.
        orderBy(
          orderByField === "__name__" ? documentId() : orderByField,
          direction
        ),
        ...(cursor ? [startAfter(cursor)] : []),
        limitTo(batchSize)
      )
      const snap = await getDocs(page)
      if (snap.empty) break
      cursor = snap.docs[snap.docs.length - 1]
      fetched += snap.size

      for (const d of snap.docs) {
        const data = toAdminTypes(d.data()) as DocumentData
        try {
          if (config.filter && !config.filter(data)) continue
          docs.push(config.convert(data) as ExportedDoc)
          if (limit !== undefined && docs.length >= limit) break
        } catch (error: any) {
          failures++
          console.error(`Failed to convert ${d.ref.path}: ${error.message}`)
        }
      }
      onProgress?.(fetched, docs.length)
      if (snap.size < batchSize) break
    }
  }

  return { docs, failures }
}
