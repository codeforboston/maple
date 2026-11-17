import {
  AddResult,
  describeSummary,
  scrapeList,
  scrapeSequential
} from "./scrapeLoop"

const added: AddResult = { status: "added" }
const missing: AddResult = { status: "missing" }

/** An add function backed by a table of results; unknown numbers are missing. */
function fakeSource(results: Record<number, AddResult | Error>) {
  const calls: number[] = []
  const add = async (n: number): Promise<AddResult> => {
    calls.push(n)
    const r = results[n]
    if (r instanceof Error) throw r
    return r ?? missing
  }
  return { add, calls }
}

describe("scrapeList", () => {
  it("continues past missing and failed roll calls", async () => {
    const { add, calls } = fakeSource({
      1: added,
      2: { status: "failed", reason: "bad pdf" },
      4: added
    })
    const summary = await scrapeList([1, 2, 3, 4], add)
    expect(calls).toEqual([1, 2, 3, 4])
    expect(summary).toEqual({
      added: [1, 4],
      missing: [3],
      failed: [[2, "bad pdf"]]
    })
  })

  it("records a thrown error as a failure and keeps going", async () => {
    const { add } = fakeSource({ 1: new Error("timeout"), 2: added })
    const summary = await scrapeList([1, 2], add)
    expect(summary.added).toEqual([2])
    expect(summary.failed).toEqual([[1, "Error: timeout"]])
  })

  it("stops on a fatal result", async () => {
    const { add, calls } = fakeSource({
      1: { status: "fatal", reason: "no members" },
      2: added
    })
    const summary = await scrapeList([1, 2], add)
    expect(calls).toEqual([1])
    expect(summary.fatal).toBe("no members")
  })
})

describe("scrapeSequential", () => {
  it("starts at the given number and skips stored roll calls", async () => {
    const { add, calls } = fakeSource({ 0: added, 2: added, 3: added })
    const summary = await scrapeSequential(0, new Set([1]), add, 2)
    expect(calls).toEqual([0, 2, 3, 4, 5])
    expect(summary.added).toEqual([0, 2, 3])
  })

  it("steps over a gap shorter than the limit", async () => {
    const { add } = fakeSource({ 1: added, 3: added })
    const summary = await scrapeSequential(1, new Set(), add, 2)
    expect(summary.added).toEqual([1, 3])
    expect(summary.missing).toEqual([2, 4, 5])
  })

  it("does not count failures as missing", async () => {
    const failed: AddResult = { status: "failed", reason: "matching error" }
    const { add, calls } = fakeSource({ 1: failed, 2: failed, 3: added })
    const summary = await scrapeSequential(1, new Set(), add, 2)
    expect(calls).toEqual([1, 2, 3, 4, 5])
    expect(summary.added).toEqual([3])
    expect(summary.failed.map(([n]) => n)).toEqual([1, 2])
  })

  it("stops on a fatal result", async () => {
    const { add, calls } = fakeSource({
      1: { status: "fatal", reason: "no members" }
    })
    const summary = await scrapeSequential(1, new Set(), add)
    expect(calls).toEqual([1])
    expect(summary.fatal).toBe("no members")
  })

  it("never runs past maxNumber", async () => {
    const add = jest.fn(async (): Promise<AddResult> => added)
    await scrapeSequential(0, new Set(), add, 5, 9)
    expect(add).toHaveBeenCalledTimes(10)
  })
})

describe("describeSummary", () => {
  it("reports gaps but not the misses past the last roll call", () => {
    expect(
      describeSummary("Senate 193", {
        added: [194, 196],
        missing: [195, 197, 198],
        failed: [[199, "bad pdf"]]
      })
    ).toBe(
      "Senate 193: added 2 (#194-#196), missing 195, failed #199 (bad pdf)"
    )
  })
})
