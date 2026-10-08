import {
  aliasForUpgradeId,
  chunkBatchBudget,
  chunkPath,
  MAX_BATCHES_PER_CHUNK,
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

describe("chunkBatchBudget", () => {
  const cap = MAX_BATCHES_PER_CHUNK
  it.each`
    numBatches   | batchesSoFar | expected | why
    ${undefined} | ${10_000}    | ${cap}   | ${"a full run is capped however far it has got"}
    ${cap * 4}   | ${0}         | ${cap}   | ${"a budget larger than one chunk is capped"}
    ${cap + 3}   | ${cap}       | ${3}     | ${"only what is left of the budget is handed over"}
    ${4}         | ${9}         | ${0}     | ${"a spent budget floors at zero, so nextChunk ends the run"}
  `("$why", ({ numBatches, batchesSoFar, expected }) => {
    expect(chunkBatchBudget({ numBatches, batchesSoFar })).toBe(expected)
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
