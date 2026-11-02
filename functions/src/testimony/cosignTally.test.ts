import { Timestamp } from "../firebase"
import { cosignTally } from "./cosignTally"

const at = (millis: number) => Timestamp.fromMillis(millis)

describe("cosignTally", () => {
  it("tallies no cosigns as zero, with no last cosign", () => {
    expect(cosignTally([])).toEqual({
      cosignCount: 0,
      cosignSenateDistrictCount: 0,
      cosignHouseDistrictCount: 0,
      lastCosignedAt: undefined
    })
  })

  it("counts distinct districts per chamber", () => {
    expect(
      cosignTally([
        {
          senatorDistrict: "First Essex",
          representativeDistrict: "3rd Essex",
          firstPublishedAt: at(1)
        },
        {
          senatorDistrict: "First Essex",
          representativeDistrict: "4th Essex",
          firstPublishedAt: at(2)
        }
      ])
    ).toMatchObject({
      cosignCount: 2,
      cosignSenateDistrictCount: 1,
      cosignHouseDistrictCount: 2
    })
  })

  it("counts a cosigner with no district toward the total only", () => {
    expect(
      cosignTally([
        { senatorDistrict: "First Essex", firstPublishedAt: at(1) },
        { firstPublishedAt: at(2) }
      ])
    ).toMatchObject({
      cosignCount: 2,
      cosignSenateDistrictCount: 1,
      cosignHouseDistrictCount: 0
    })
  })

  it("takes the latest first filing as the last cosign", () => {
    expect(
      cosignTally([
        { firstPublishedAt: at(2000) },
        { firstPublishedAt: at(3000) },
        { firstPublishedAt: at(1000) }
      ]).lastCosignedAt
    ).toEqual(at(3000))
  })
})
