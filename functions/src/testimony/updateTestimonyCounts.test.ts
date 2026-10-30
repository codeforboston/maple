import { conferenceCountFields } from "../conferences/types"
import { billCountFields } from "./types"
import { updateTestimonyCounts } from "./updateTestimonyCounts"

describe("updateTestimonyCounts", () => {
  it("increments counts for a new publication", () => {
    expect(
      updateTestimonyCounts(
        billCountFields,
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
        billCountFields,
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
        billCountFields,
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

  it("ignores fields outside the given set", () => {
    expect(
      updateTestimonyCounts(
        billCountFields,
        {
          testimonyCount: 2,
          endorseCount: 2,
          neutralCount: 0,
          opposeCount: 0,
          latestTestimonyId: "x"
        } as any,
        { position: "endorse" },
        { position: "oppose" }
      )
    ).toEqual({
      testimonyCount: 2,
      endorseCount: 1,
      neutralCount: 0,
      opposeCount: 1
    })
  })

  it("moves conference counts between the four stances", () => {
    expect(
      updateTestimonyCounts(
        conferenceCountFields,
        {
          testimonyCount: 1,
          passNothingCount: 0,
          passSomethingCount: 0,
          passSenateVersionCount: 1,
          passHouseVersionCount: 0
        },
        { position: "passSenateVersion" },
        { position: "passHouseVersion" }
      )
    ).toEqual({
      testimonyCount: 1,
      passNothingCount: 0,
      passSomethingCount: 0,
      passSenateVersionCount: 0,
      passHouseVersionCount: 1
    })
  })

  it("throws on a position without a field in the set", () => {
    expect(() =>
      updateTestimonyCounts(
        billCountFields,
        { testimonyCount: 0, endorseCount: 0, neutralCount: 0, opposeCount: 0 },
        undefined,
        { position: "passNothing" }
      )
    ).toThrow("No count field for position passNothing")
  })

  it("throws on an unknown position", () => {
    expect(() =>
      updateTestimonyCounts(
        billCountFields,
        { testimonyCount: 1, endorseCount: 0, neutralCount: 0, opposeCount: 0 },
        { position: "bogus" as any },
        undefined
      )
    ).toThrow("No count field for position bogus")
  })
})
