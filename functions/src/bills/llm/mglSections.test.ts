import { readFileSync } from "fs"
import { join } from "path"
import { axios } from "../../malegislature"
import {
  extractBillContext,
  extractSections,
  getChapSecNames,
  queryAllSectionText,
  querySectionText
} from "./mglSections"

jest.mock("../../malegislature", () => ({ axios: { get: jest.fn() } }))
const get = axios.get as jest.Mock

// Expected values were produced by `extract_sections` and
// `get_chap_sec_names_internal` in the Python implementation.
const fixture = JSON.parse(
  readFileSync(join(__dirname, "__fixtures__/helpers.python.json"), "utf8")
)

beforeEach(() => get.mockReset())

describe("extractSections", () => {
  it.each(fixture.extractSections as { text: string; sections: string[][] }[])(
    "matches the Python implementation for case %#",
    ({ text, sections }) => {
      expect(extractSections(text)).toEqual(sections)
    }
  )

  it("ignores SECTION references to the bill itself", () => {
    expect(extractSections("SECTION 1. SECTION 2.")).toEqual([])
  })
})

describe("getChapSecNames", () => {
  it("matches the Python implementation", () => {
    expect(getChapSecNames(fixture.chapSecNames.input)).toBe(
      fixture.chapSecNames.output
    )
  })

  it("skips references that are not in the table", () => {
    expect(getChapSecNames([["999", "1"]])).toBe("")
  })
})

describe("querySectionText", () => {
  it("returns the section text", async () => {
    get.mockResolvedValue({ data: { Text: "Section text" } })
    await expect(querySectionText(["12", "5"])).resolves.toBe("Section text")
    expect(get).toHaveBeenCalledWith("/Chapters/12/Sections/5")
  })

  it.each([
    ["a missing Text field", { data: {} }],
    ["null text", { data: { Text: null } }],
    ["empty text", { data: { Text: "" } }]
  ])("returns undefined for %s", async (_name, response) => {
    get.mockResolvedValue(response)
    await expect(querySectionText(["12", "5"])).resolves.toBeUndefined()
  })

  it("returns undefined when the request fails", async () => {
    get.mockRejectedValue(new Error("404"))
    await expect(querySectionText(["12", "5"])).resolves.toBeUndefined()
  })
})

describe("queryAllSectionText", () => {
  it("returns each section's text once, in order, and reports empty ones", async () => {
    get.mockImplementation(async (url: string) => {
      if (url.includes("/Sections/2")) return { data: {} }
      return { data: { Text: `text for ${url}` } }
    })
    const result = await queryAllSectionText([
      ["1", "1"],
      ["1", "2"],
      ["1", "3"]
    ])
    expect(result.formattedData).toEqual([
      "text for /Chapters/1/Sections/1",
      "text for /Chapters/1/Sections/3"
    ])
    expect(result.emptyResponses).toEqual([["1", "2"]])
  })

  it("handles more references than one request batch", async () => {
    get.mockImplementation(async (url: string) => ({ data: { Text: url } }))
    const sections: [string, string][] = Array.from({ length: 12 }, (_, i) => [
      "1",
      `${i + 1}`
    ])
    const result = await queryAllSectionText(sections)
    expect(result.formattedData).toEqual(
      sections.map(([c, s]) => `/Chapters/${c}/Sections/${s}`)
    )
  })
})

describe("extractBillContext", () => {
  it("joins section text and names the referenced sections", async () => {
    get.mockImplementation(async (url: string) => ({ data: { Text: url } }))
    const context = await extractBillContext(
      "Section 1 of chapter 2 and section 15D of chapter 2."
    )
    expect(context.combinedMgl).toBe(
      "/Chapters/2/Sections/1 /Chapters/2/Sections/15D"
    )
    expect(context.mglNames).toBe(
      "ARMS, GREAT SEAL AND OTHER EMBLEMS OF THE COMMONWEALTH: Coat of arms of commonwealth"
    )
  })

  it("is 'None' when the bill references no MGL text", async () => {
    const context = await extractBillContext("A bill with no references.")
    expect(context).toEqual({ combinedMgl: "None", mglNames: "" })
    expect(get).not.toHaveBeenCalled()
  })
})
