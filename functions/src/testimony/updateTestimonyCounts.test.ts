import { updateTestimonyCounts } from "./updateTestimonyCounts"

describe("updateTestimonyCounts", () => {
  it("increments counts for a new publication", () => {
    expect(
      updateTestimonyCounts(
        {
          testimonyCount: 0,
          endorseCount: 0,
          neutralCount: 0,
          opposeCount: 0
        },
        undefined,
        { position: "endorse" }
      )
    ).toEqual({
      testimonyCount: 1,
      endorseCount: 1,
      neutralCount: 0,
      opposeCount: 0
    })
  })

  it("swaps counts correctly when a testimony changes position", () => {
    expect(
      updateTestimonyCounts(
        {
          testimonyCount: 3,
          endorseCount: 1,
          neutralCount: 1,
          opposeCount: 1
        },
        { position: "neutral" },
        { position: "oppose" }
      )
    ).toEqual({
      testimonyCount: 3,
      endorseCount: 1,
      neutralCount: 0,
      opposeCount: 2
    })
  })

  it("decrements counts for a deletion without going below zero", () => {
    expect(
      updateTestimonyCounts(
        {
          testimonyCount: 1,
          endorseCount: 1,
          neutralCount: 0,
          opposeCount: 0
        },
        { position: "endorse" },
        undefined
      )
    ).toEqual({
      testimonyCount: 0,
      endorseCount: 0,
      neutralCount: 0,
      opposeCount: 0
    })
  })
})
