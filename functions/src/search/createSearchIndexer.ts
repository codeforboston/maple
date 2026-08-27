import { EventContext, runWith } from "firebase-functions"
import { nanoid } from "nanoid"
import { db, QueryDocumentSnapshot, Timestamp } from "../firebase"
import {
  BackfillConfig,
  ChunkDoc,
  chunkPath,
  CHUNK_BUDGET_MS,
  MAX_EVENT_AGE_MS,
  NO_TOTALS,
  nextChunk,
  Totals,
  upgradePath,
  UpgradeRun
} from "./backfillRun"
import { BaseRecord, CollectionConfig, registerConfig } from "./config"
import { SearchIndexer } from "./SearchIndexer"

export function createSearchIndexer<T extends BaseRecord = BaseRecord>(
  config: CollectionConfig<T>
) {
  registerConfig(config)
  return {
    upgradeSearchIndex: runWith({
      /** This only starts the run — create the collection, record it, write the
       * first chunk. The backfill itself is a chain of `runBackfillChunk`
       * invocations, each with its own 540s budget and its own cursor, so the
       * work no longer has to fit in one timeout to converge.
       */
      timeoutSeconds: 120,
      secrets: ["TYPESENSE_API_KEY"]
    })
      .firestore.document(upgradePath(config.alias))
      .onCreate(snap => startUpgrade(config, snap)),

    /** Runs one chunk of a backfill, then either chains the next chunk or swaps
     * the alias. `failurePolicy` gives the retries: a chunk resumes from its own
     * cursor, imports upserts into a collection nothing is aliased to yet, and
     * writes totals relative to the baseline on its own document, so running it
     * more than once converges rather than double-counting.
     */
    runBackfillChunk: runWith({
      timeoutSeconds: 540,
      memory: "512MB",
      secrets: ["TYPESENSE_API_KEY"],
      failurePolicy: true
    })
      .firestore.document(`${upgradePath(config.alias)}/chunks/{chunkId}`)
      .onCreate((snap, context) => advanceBackfill(config, snap, context)),

    syncToSearchIndex: runWith({
      timeoutSeconds: 30,
      secrets: ["TYPESENSE_API_KEY"]
    })
      .firestore.document(config.documentTrigger)
      .onWrite(async change => {
        await new SearchIndexer(config).syncDocument(change)
      })
  }
}

async function startUpgrade(
  config: CollectionConfig<any>,
  snap: QueryDocumentSnapshot
) {
  const { numBatches } = BackfillConfig.parse(snap.data())

  // Deliveries are at-least-once: a replayed create event must not mint a
  // second runId — overwriting the recorded one would orphan every chunk of
  // the run already in flight, since each would fail loadRun's runId check.
  // A replay only makes sure the recorded run has its first chunk, which also
  // repairs a first delivery that crashed between the two writes below.
  const existing = (await snap.ref.get()).data()
  if (existing?.runId) {
    console.log(
      `Upgrade ${snap.ref.path} already started (run ${existing.runId}); ensuring chunk 0 exists`
    )
    await createChunk(config.alias, {
      runId: String(existing.runId),
      index: 0,
      cursor: null,
      before: NO_TOTALS
    })
    return
  }

  const indexer = new SearchIndexer(config)
  await indexer.beginUpgrade()
  const runId = nanoid()

  const run: UpgradeRun = {
    runId,
    collectionName: indexer.targetCollectionName,
    status: "running",
    cursor: null,
    totals: NO_TOTALS,
    chunks: 1,
    ...(numBatches === undefined ? {} : { numBatches })
  }
  // update(), not a merge set: if the upgrade document was deleted while this
  // ran (a rescheduled upgrade), resurrecting it here would collide with the
  // replacement run's create.
  await snap.ref.update({
    ...run,
    startedAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })

  const chunk: ChunkDoc = { runId, index: 0, cursor: null, before: NO_TOTALS }
  await createChunk(config.alias, chunk)
  console.log(
    `Started backfill of ${run.collectionName} (run ${runId})`,
    numBatches === undefined ? "" : `limited to ${numBatches} batches`
  )
}

/** Creates a chunk document, treating "it already exists" as success: chunk
 * events are delivered at least once, so a replayed invocation can find the
 * successor it already created. Throwing instead would loop failurePolicy's
 * retries into the age gate, which would mark a healthy run failed. */
async function createChunk(alias: string, chunk: ChunkDoc) {
  try {
    await db.doc(chunkPath(alias, chunk.index)).create(chunk)
  } catch (e: any) {
    const alreadyExists =
      e?.code === 6 || /ALREADY[_-]?EXISTS/i.test(String(e?.message ?? e))
    if (!alreadyExists) throw e
    console.log(
      `Chunk ${chunk.index} of ${alias} already exists; leaving it to its own event`
    )
  }
}

async function advanceBackfill(
  config: CollectionConfig<any>,
  snap: QueryDocumentSnapshot,
  context: EventContext
) {
  const { alias } = config
  const runRef = snap.ref.parent.parent!
  const indexer = new SearchIndexer(config)

  // The age gate runs before anything that can throw — parsing included —
  // or a persistently unparseable chunk or run document would retry for
  // failurePolicy's full seven days with the run never marked failed.
  // Returning without a throw is what ends the retry chain; the run is
  // additionally failed when the chunk provably belongs to it, since only
  // then is writing to the run document safe.
  const age = Date.now() - Date.parse(context.timestamp)
  if (age > MAX_EVENT_AGE_MS) {
    const error = `Chunk ${snap.id} of ${alias} still failing ${Math.round(
      age / 60_000
    )} minutes after it was created; giving up`
    console.error(error)
    try {
      const staleChunk = ChunkDoc.parse(snap.data())
      const staleRun = await loadRun(
        runRef,
        staleChunk,
        indexer.targetCollectionName
      )
      if (staleRun) await fail(runRef, error)
    } catch (e) {
      console.error(`Could not mark the run failed: ${e}`)
    }
    return
  }

  const chunk = ChunkDoc.parse(snap.data())
  const run = await loadRun(runRef, chunk, indexer.targetCollectionName)
  if (!run) return

  try {
    const result = await indexer.backfillChunk({
      startAfter: chunk.cursor,
      maxBatches:
        run.numBatches === undefined
          ? undefined
          : Math.max(run.numBatches - chunk.before.batches, 0),
      budgetMs: CHUNK_BUDGET_MS
    })

    // Absolute, not incremental: a replayed chunk redoes exactly its own range,
    // so baseline + result lands on the same totals however often it runs.
    const totals: Totals = {
      batches: chunk.before.batches + result.batches,
      documents: chunk.before.documents + result.documents,
      convertFailures: chunk.before.convertFailures + result.convertFailures
    }
    console.log(
      `Chunk ${chunk.index} of ${alias}: ${result.batches} batches, ${result.documents} documents, cursor ${result.cursor}`
    )

    const progress = {
      cursor: result.cursor,
      totals,
      updatedAt: Timestamp.now()
    }
    const next = nextChunk({
      runId: chunk.runId,
      index: chunk.index,
      cursor: result.cursor,
      totals,
      numBatches: run.numBatches
    })

    switch (next.type) {
      case "done":
        await indexer.finishUpgrade()
        await runRef.update({
          ...progress,
          status: "done",
          finishedAt: Timestamp.now()
        })
        console.log(
          `Backfill of ${run.collectionName} complete after ${totals.batches} batches`
        )
        break
      case "failed":
        await fail(runRef, next.error, progress)
        break
      case "next":
        await runRef.update({ ...progress, chunks: next.chunk.index + 1 })
        await createChunk(alias, next.chunk)
        break
    }
  } catch (e: any) {
    // Recorded for operators, then rethrown so the retry policy sees a failure
    // and runs this chunk again from the same cursor. update(), not a merge
    // set: if the run document was deleted mid-chunk by a rescheduled upgrade,
    // resurrecting a partial copy of it would break the replacement run.
    try {
      await runRef.update({
        lastError: String(e?.message ?? e),
        updatedAt: Timestamp.now()
      })
    } catch {
      // Run document gone; the retry's loadRun will drop this chunk.
    }
    throw e
  }
}

/** Reads the run this chunk belongs to, or null when the chunk has been
 * superseded — a second upgrade was scheduled, the run already finished, or the
 * deployed config now hashes to a different collection. */
async function loadRun(
  runRef: FirebaseFirestore.DocumentReference,
  chunk: ChunkDoc,
  targetCollectionName: string
) {
  const snap = await runRef.get()
  if (!snap.exists) {
    console.log(`Upgrade ${runRef.path} is gone; dropping chunk ${chunk.index}`)
    return null
  }
  const run = UpgradeRun.parse(snap.data())
  if (run.runId !== chunk.runId) {
    console.log(
      `Chunk ${chunk.index} belongs to run ${chunk.runId}, but ${run.runId} is current; dropping it`
    )
    return null
  }
  if (run.status !== "running") {
    console.log(
      `Run ${run.runId} is ${run.status}; dropping chunk ${chunk.index}`
    )
    return null
  }
  if (run.collectionName !== targetCollectionName) {
    console.log(
      `Run ${run.runId} targets ${run.collectionName} but this deploy builds ${targetCollectionName}; dropping chunk ${chunk.index}`
    )
    return null
  }
  return run
}

async function fail(
  runRef: FirebaseFirestore.DocumentReference,
  error: string,
  progress: object = {}
) {
  // update(), not a merge set, so a deleted run document stays deleted — see
  // the catch in advanceBackfill.
  await runRef.update({
    ...progress,
    status: "failed",
    lastError: error,
    finishedAt: Timestamp.now()
  })
}
