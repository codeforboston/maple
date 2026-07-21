import { electionsPageInfo } from "./scrapeElections"

import fs from "fs"
import path from "path"
import { JSDOM, VirtualConsole } from "jsdom"

const FIXTURES_DIR = path.resolve(
  __dirname,
  "../../../tests/fixtures/electionResults"
)

const electionTable = fs.readFileSync(
  path.join(FIXTURES_DIR, "2016_general_table.html"),
  "utf8"
)

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  text: async () => electionTable,
}) as jest.Mock

describe("electionsPageInfo test", () => {
  for (const htmlFile of ["2016_general.html", "2022_to_2026.html", "2024_republican_primaries.html"]) {
    const basename = path.basename(htmlFile, ".html")

    it(basename, async () => {
      const html = fs.readFileSync(
        path.join(FIXTURES_DIR, htmlFile),
        "utf8"
      )

      const virtualConsole = new VirtualConsole()
      virtualConsole.on("jsdomError", error => {
        if (error.message.includes("Could not parse CSS stylesheet")) {
          return
        }
        console.error(error)
      })
      const dom = new JSDOM(html, { virtualConsole })

      const actual = await electionsPageInfo(dom)
      const expected = JSON.parse(
        fs.readFileSync(
          path.join(FIXTURES_DIR, `${basename}.json`),
          "utf8"
        )
      )

      expect(actual).toHaveLength(expected.length)

      for (const [i, expectedItem] of expected.entries()) {
        expect(actual[i]).toEqual(expectedItem)
      }
    })
  }
})

