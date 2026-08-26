/** Builds a corpus from a live MAPLE project without any credentials.
 *
 * firestore.rules grants unauthenticated read on every collection a corpus is
 * built from — `events` and `generalCourts/**` are "public, read-only", and
 * publishedTestimony has an explicit `match /{path=**}/publishedTestimony/{id}`
 * rule so it can be read as a collection group. So the web client SDK reads it
 * with nothing but a project id, which is what makes hearings and testimony
 * corpora reachable to contributors who have no service account.
 *
 * Bills is the exception: its rule is path-scoped to `generalCourts/**` and
 * does not grant collection-group scope, so a collectionGroup("bills") read is
 * denied here. Bills is exported from the committed emulator fixture instead
 * (scripts/firebase-admin/exportSearchCorpus.ts), where the admin SDK bypasses
 * rules.
 */
import { initializeApp } from "firebase/app"
import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp as ClientTimestamp,
  collection,
  collectionGroup,
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

/** The collection to read, derived from the config's document trigger so it
 * cannot drift from the indexer's own source. "events/{eventId}" reads the
 * events collection; "users/{uid}/publishedTestimony/{id}" reads
 * publishedTestimony as a collection group.
 *
 * Any `where` on config.sourceCollection is deliberately not reproduced —
 * config.filter is the authority on which documents belong in the index, and
 * it is applied to every document below.
 */
export function sourceFromTrigger(documentTrigger: string) {
  const segments = documentTrigger.split("/").filter(Boolean)
  if (segments.length < 2 || segments.length % 2 !== 0)
    throw Error(`Cannot read a collection out of trigger "${documentTrigger}"`)
  return {
    collectionId: segments[segments.length - 2],
    isCollectionGroup: segments.length > 2
  }
}

export async function fetchRemoteDocs({
  env,
  config,
  limit,
  orderByField,
  direction,
  onProgress
}: {
  env: RemoteEnv
  config: CollectionConfig
  limit?: number
  orderByField: string
  direction: "asc" | "desc"
  onProgress?: (fetched: number, kept: number) => void
}): Promise<{ docs: ExportedDoc[]; failures: number }> {
  const projectId = projects[env]
  const { collectionId, isCollectionGroup } = sourceFromTrigger(
    config.documentTrigger
  )

  const app = initializeApp({ projectId }, `search-eval-${env}`)
  const db = getFirestore(app)
  const source = isCollectionGroup
    ? collectionGroup(db, collectionId)
    : collection(db, collectionId)

  const docs: ExportedDoc[] = []
  let failures = 0
  let fetched = 0
  let cursor: QueryDocumentSnapshot<DocumentData> | undefined

  while (limit === undefined || docs.length < limit) {
    const page = query(
      source,
      orderBy(orderByField, direction),
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

  return { docs, failures }
}
