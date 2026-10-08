import { CollectionConfig } from "./config"
import { IMPORT_BYTE_BUDGET, SearchIndexer } from "./SearchIndexer"

jest.mock("../firebase", () => ({
  db: { doc: (path: string) => ({ path }), recursiveDelete: jest.fn() },
  FieldPath: { documentId: () => "__name__" },
  Timestamp: { now: () => ({}) }
}))

jest.mock("./forceGc", () => ({ forceGc: jest.fn() }))
import { forceGc } from "./forceGc"

const imports: any[][] = []
jest.mock("./client", () => ({
  createClient: () => ({
    collections: () => ({
      exists: async () => true,
      documents: () => ({
        // The indexer sends a pre-serialized JSONL body and reads the raw
        // per-line results back, like the real client's string form.
        import: async (body: string) => {
          const docs = body.split("\n").map(line => JSON.parse(line))
          imports.push(docs)
          return docs.map(() => JSON.stringify({ success: true })).join("\n")
        }
      })
    })
  })
}))

/** A source that behaves like an ordered, cursor-driven Firestore query, keyed
 * by document path the way listBatch's documentId() ordering is. `path`
 * defaults to `id`; give docs distinct paths to model duplicated idField
 * values (the same bill number in several courts).
 */
function fakeSource(docs: { id: string; body: string; path?: string }[]) {
  const pathOf = (d: { id: string; path?: string }) => d.path ?? d.id
  const build = (startAfter: string | null, limit: number): any => ({
    orderBy: () => build(startAfter, limit),
    limit: (n: number) => build(startAfter, n),
    startAfter: (cursor: { path: string }) => build(cursor.path, limit),
    get: async () => {
      const rest =
        startAfter === null ? docs : docs.filter(d => pathOf(d) > startAfter)
      const batch = rest.slice(0, limit)
      return {
        size: batch.length,
        docs: batch.map(d => ({
          exists: true,
          id: pathOf(d),
          ref: { path: pathOf(d) },
          data: () => d,
          get: (field: string) => (d as any)[field]
        }))
      }
    }
  })
  return build(null, 0)
}

const pad = (n: number) => String(n).padStart(6, "0")

const makeIndexer = (
  docs: { id: string; body: string }[],
  batchSize?: number
) =>
  new SearchIndexer({
    alias: "widgets",
    schema: { fields: [{ name: "body", type: "string" }] },
    sourceCollection: fakeSource(docs) as any,
    documentTrigger: "widgets/{id}",
    idField: "id",
    convert: (data: any) => ({ id: data.id, body: data.body }),
    batchSize
  } as CollectionConfig)

beforeEach(() => {
  imports.length = 0
  jest.mocked(forceGc).mockClear()
})

describe("importBatch", () => {
  const chunk = { startAfter: null, budgetMs: 60_000 }

  it("imports a batch that fits the byte budget in one call", async () => {
    const docs = [1, 2, 3].map(n => ({ id: pad(n), body: "x".repeat(1000) }))
    await makeIndexer(docs).backfillChunk(chunk)
    expect(imports).toHaveLength(1)
    expect(imports[0]).toHaveLength(3)
  })

  it("splits a batch on the byte boundary, not the document count", async () => {
    // Three documents at 40% of the budget each: two fit, the third does not.
    const body = "x".repeat(Math.floor(IMPORT_BYTE_BUDGET * 0.4))
    const docs = [1, 2, 3].map(n => ({ id: pad(n), body }))
    await makeIndexer(docs).backfillChunk(chunk)
    expect(imports.map(i => i.length)).toEqual([2, 1])
  })

  it("sends a single oversized document on its own", async () => {
    const docs = [
      { id: pad(1), body: "x".repeat(1000) },
      { id: pad(2), body: "x".repeat(IMPORT_BYTE_BUDGET + 1) },
      { id: pad(3), body: "x".repeat(1000) }
    ]
    await makeIndexer(docs).backfillChunk(chunk)
    expect(imports.map(i => i.map((d: any) => d.id))).toEqual([
      [pad(1)],
      [pad(2)],
      [pad(3)]
    ])
  })
})

describe("backfillChunk", () => {
  const docs = Array.from({ length: 600 }, (_, n) => ({
    id: pad(n),
    body: "x"
  }))

  it("reports a null cursor and every document when the source is exhausted", async () => {
    const result = await makeIndexer(docs).backfillChunk({
      startAfter: null,
      budgetMs: 60_000
    })
    expect(result.cursor).toBeNull()
    expect(result.batches).toBe(3)
    expect(result.documents).toBe(600)
  })

  it("stops on the batch budget and hands back a resumable cursor", async () => {
    const result = await makeIndexer(docs).backfillChunk({
      startAfter: null,
      maxBatches: 1,
      budgetMs: 60_000
    })
    expect(result.batches).toBe(1)
    expect(result.documents).toBe(250)
    expect(result.cursor).toBe(pad(249))
  })

  it("resumes after the cursor it was handed", async () => {
    const result = await makeIndexer(docs).backfillChunk({
      startAfter: pad(249),
      budgetMs: 60_000
    })
    expect(result.documents).toBe(350)
    expect(result.cursor).toBeNull()
    expect(imports.flat().map(d => d.id)).not.toContain(pad(249))
    expect(imports.flat()[0].id).toBe(pad(250))
  })

  it("resumes across a boundary that splits documents sharing an idField value", async () => {
    // Three source docs per idField value — a bill number appearing in three
    // general courts — with distinct paths. 250 is not a multiple of 3, so the
    // batch boundary lands inside a group; a value cursor on idField would skip
    // the rest of that group on resume, where the path cursor does not.
    const grouped = Array.from({ length: 600 }, (_, n) => ({
      id: `H${pad(Math.floor(n / 3))}`,
      body: "x",
      path: pad(n)
    }))
    const first = await makeIndexer(grouped).backfillChunk({
      startAfter: null,
      maxBatches: 1,
      budgetMs: 60_000
    })
    expect(first.cursor).toBe(pad(249))
    const resumed = await makeIndexer(grouped).backfillChunk({
      startAfter: first.cursor!,
      budgetMs: 60_000
    })
    expect(first.documents + resumed.documents).toBe(600)
  })

  it("reads batches at the size its config asks for", async () => {
    const result = await makeIndexer(docs, 50).backfillChunk({
      startAfter: null,
      maxBatches: 1,
      budgetMs: 60_000
    })
    expect(result.documents).toBe(50)
    expect(result.cursor).toBe(pad(49))
  })

  it("reports the serialized size of everything it imported", async () => {
    const body = "x".repeat(1000)
    const result = await makeIndexer(
      [1, 2, 3].map(n => ({ id: pad(n), body }))
    ).backfillChunk({ startAfter: null, budgetMs: 60_000 })

    // Exactly the JSONL the stub was handed: each line plus its newline.
    const expected = imports
      .flat()
      .reduce((sum, d) => sum + Buffer.byteLength(JSON.stringify(d)) + 1, 0)
    expect(result.bytes).toBe(expected)
  })

  /** The chunk total spans every batch, so it is the peak that says how much
   * sits in memory at once — the number `batchSize` is chosen against. */
  it("collects after every batch and reports resident memory", async () => {
    const result = await makeIndexer(docs).backfillChunk({
      startAfter: null,
      budgetMs: 60_000
    })
    expect(result.batches).toBe(3)
    expect(forceGc).toHaveBeenCalledTimes(3)
    expect(result.peakRssBytes).toBeGreaterThan(0)
    expect(result.peakRssAfterGcBytes).toBeGreaterThan(0)
  })

  it("reports the largest single batch, not just the chunk total", async () => {
    const small = "x".repeat(1000)
    const large = "x".repeat(50_000)
    // 250 to a batch: the first batch is all small, the second holds the large.
    const mixed = Array.from({ length: 300 }, (_, n) => ({
      id: pad(n),
      body: n < 250 ? small : large
    }))

    const result = await makeIndexer(mixed).backfillChunk({
      startAfter: null,
      budgetMs: 60_000
    })
    expect(result.batches).toBe(2)
    expect(result.peakBatchBytes).toBeLessThan(result.bytes)
    // The 50-document tail batch dwarfs the 250-document head batch.
    expect(result.peakBatchBytes).toBeGreaterThan(result.bytes / 2)
  })

  it("counts documents that fail to convert without aborting the chunk", async () => {
    const indexer = new SearchIndexer({
      alias: "widgets",
      schema: { fields: [{ name: "body", type: "string" }] },
      sourceCollection: fakeSource(docs.slice(0, 3)) as any,
      documentTrigger: "widgets/{id}",
      idField: "id",
      convert: (data: any) => {
        if (data.id === pad(1)) throw Error("Invalid widget")
        return { id: data.id, body: data.body }
      }
    } as CollectionConfig)

    const result = await indexer.backfillChunk({
      startAfter: null,
      budgetMs: 60_000
    })
    expect(result.convertFailures).toBe(1)
    expect(result.documents).toBe(2)
  })
})
