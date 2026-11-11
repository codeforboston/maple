import {
  getHouseRollCall,
  HouseRollCallResult,
  translateNames
} from "./scrapeRollCall"

import fs from "fs"
import path from "path"

const FIXTURES_DIR = path.resolve(__dirname, "../../../tests/fixtures/votes")

const pdf = fs.readFileSync(path.join(FIXTURES_DIR, "HouseRollCall19.pdf"))

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  arrayBuffer: async () =>
    pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength)
}) as jest.Mock

describe("getHouseRollCall test", () => {
  it("HouseRollCall19", async () => {
    const legislators_file = fs.readFileSync(
      path.join(FIXTURES_DIR, "193legislators.json"),
      "utf8"
    )
    const legislators: [string, string][] = JSON.parse(legislators_file)

    const actualRead = await getHouseRollCall(193, 19)
    const expectedRead = JSON.parse(
      fs.readFileSync(
        path.join(FIXTURES_DIR, "HouseRollCall19Read.json"),
        "utf8"
      )
    )
    expectedRead.time = new Date(expectedRead.time)
    expect(actualRead).toEqual(expectedRead)
    const expectedTranslation = JSON.parse(
      fs.readFileSync(
        path.join(FIXTURES_DIR, "HouseRollCall19Translation.json"),
        "utf8"
      )
    )
    const read = <HouseRollCallResult>actualRead
    const names = read.votes.map(
      vote => [vote.initial, vote.lastName] as [string | null, string]
    )
    const actualTranslation = translateNames(names, legislators)
    expect(actualTranslation).toEqual(expectedTranslation)
  })
})
