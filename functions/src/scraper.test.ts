import {
  chooseBatches,
  isRefreshCycleComplete,
  selectBatchRun
} from "./scraperBatching"
import { last, flattenDeep } from "lodash"
const listOfNumbers = (size: number) =>
  new Array(size).fill(undefined).map((_, i) => i.toString())

describe("chooseBatches", () => {
  it("splits into batches", () => {
    const rawIds = listOfNumbers(2000)
    const ids = chooseBatches({
      ids: rawIds,
      docsPerBatch: 100,
      numBatches: 10,
      startAfterId: ""
    })

    // Correct number of batches
    expect(ids).toHaveLength(10)
    // Batches are the correct size
    ids.forEach(batch => expect(batch).toHaveLength(100))

    const ids2 = chooseBatches({
      ids: rawIds,
      docsPerBatch: 100,
      numBatches: 10,
      startAfterId: last(last(ids))!
    })

    const allIds = flattenDeep([ids, ids2]),
      sortedIds = [...allIds].sort()

    // Batches are sorted
    expect(sortedIds).toEqual(allIds)

    // Batches are exhaustive
    expect(new Set(allIds)).toEqual(new Set(rawIds))
  })

  it("starts after identified", () => {
    const rawIds = ["a", "b", "c", "d", "e"]
    const ids = chooseBatches({
      ids: rawIds,
      docsPerBatch: 1,
      numBatches: 2,
      startAfterId: "b"
    })
    expect(ids).toEqual([["c"], ["d"]])
  })

  it("wraps", () => {
    const rawIds = ["a", "b", "c", "d", "e"]
    const ids = chooseBatches({
      ids: rawIds,
      docsPerBatch: 1,
      numBatches: 2,
      startAfterId: "d"
    })
    expect(ids).toEqual([["e"], ["a"]])
  })

  it("does not return duplicates", () => {
    const rawIds = ["a", "b", "c", "d", "e"]
    let ids = chooseBatches({
      ids: rawIds,
      docsPerBatch: 1,
      numBatches: 10,
      startAfterId: ""
    })
    expect(ids).toEqual([["a"], ["b"], ["c"], ["d"], ["e"]])

    ids = chooseBatches({
      ids: rawIds,
      docsPerBatch: 10,
      numBatches: 10,
      startAfterId: "b"
    })
    expect(ids).toEqual([["c", "d", "e", "a", "b"]])
  })

  it("marks the cycle complete when a selection reaches the end of the IDs", () => {
    const selection = selectBatchRun({
      ids: ["a", "b", "c", "d", "e"],
      docsPerBatch: 1,
      numBatches: 2,
      startAfterId: "c"
    })

    expect(selection.batches).toEqual([["d"], ["e"]])
    expect(selection.nextLastId).toBe("e")
    expect(selection.cycleComplete).toBe(true)
  })

  it("starts a new pass at the first ID after the previous pass reached the end", () => {
    const selection = selectBatchRun({
      ids: ["a", "b", "c", "d", "e"],
      docsPerBatch: 1,
      numBatches: 2,
      startAfterId: "e"
    })

    expect(selection.batches).toEqual([["a"], ["b"]])
    expect(selection.nextLastId).toBe("b")
    expect(selection.cycleComplete).toBe(false)
  })

  it("does not complete a refresh until the cycle is closed and every batch finishes", () => {
    expect(
      isRefreshCycleComplete({
        cycleClosed: false,
        completedBatches: 5,
        expectedBatches: 5
      })
    ).toBe(false)
    expect(
      isRefreshCycleComplete({
        cycleClosed: true,
        completedBatches: 4,
        expectedBatches: 5
      })
    ).toBe(false)
    expect(
      isRefreshCycleComplete({
        cycleClosed: true,
        completedBatches: 5,
        expectedBatches: 5
      })
    ).toBe(true)
  })
})
