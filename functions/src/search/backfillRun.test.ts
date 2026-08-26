import {
  aliasForUpgradeId,
  chunkPath,
  MAX_CHUNKS,
  nextChunk,
  upgradePath
} from "./backfillRun"

const totals = { batches: 4, documents: 1000, convertFailures: 2 }
const run = { runId: "run-1", index: 0, cursor: "H1000", totals }

describe("nextChunk", () => {
  it("finishes when the source is exhausted", () => {
    expect(nextChunk({ ...run, cursor: null })).toEqual({ type: "done" })
  })

  it("chains the next chunk from the cursor and totals it was handed", () => {
    expect(nextChunk(run)).toEqual({
      type: "next",
      chunk: { runId: "run-1", index: 1, cursor: "H1000", before: totals }
    })
  })

  it("finishes once the numBatches budget is spent, mid-source", () => {
    expect(nextChunk({ ...run, numBatches: 4 })).toEqual({ type: "done" })
  })

  it("keeps chaining while the numBatches budget has room", () => {
    expect(nextChunk({ ...run, numBatches: 5 })).toMatchObject({
      type: "next",
      chunk: { index: 1, cursor: "H1000" }
    })
  })

  it("fails rather than chaining past the loop guard", () => {
    expect(nextChunk({ ...run, index: MAX_CHUNKS - 1 })).toEqual({
      type: "failed",
      error: expect.stringContaining("not advancing")
    })
  })
})

describe("paths", () => {
  it("round trips the alias through the upgrade document id", () => {
    expect(upgradePath("bills")).toBe("/search/upgrade-bills")
    expect(aliasForUpgradeId("upgrade-bills")).toBe("bills")
    expect(chunkPath("bills", 7)).toBe("/search/upgrade-bills/chunks/7")
  })

  it("ignores documents under /search that are not upgrade runs", () => {
    expect(aliasForUpgradeId("billSearchIndex")).toBeNull()
  })
})
