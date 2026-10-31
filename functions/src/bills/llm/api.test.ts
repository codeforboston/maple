import { CATEGORIES_BY_TOPIC } from "../types"
import {
  ALLOWED_TAGS,
  getSummaryApiFunction,
  getTagsApiFunctionV2,
  getTopicsForSummary
} from "./api"
import { callLlm } from "./callLlm"
import { extractBillContext } from "./mglSections"

jest.mock("./callLlm")
jest.mock("./mglSections")

const callLlmMock = callLlm as jest.MockedFunction<typeof callLlm>
const contextMock = extractBillContext as jest.MockedFunction<
  typeof extractBillContext
>

const respond = (response: string) =>
  callLlmMock.mockResolvedValue({ query: "q", response })

beforeEach(() => {
  jest.resetAllMocks()
  contextMock.mockResolvedValue({
    combinedMgl: "```mgl text```",
    mglNames: "Chapter 1: Section 1"
  })
})

describe("getSummaryApiFunction", () => {
  it("returns a normalized summary built from the bill and its MGL context", async () => {
    respond("Summary:\r\nIt does things.\r\n\r\nHello")

    const result = await getSummaryApiFunction("H1", "An Act", "bill text")

    expect(result.status).toBe(1)
    expect(result.summary).not.toContain("\r")
    const [details, query, callType] = callLlmMock.mock.calls[0]
    expect(details).toMatchObject({
      billId: "H1",
      billTitle: "An Act",
      mglRef: "```mgl text```",
      committeeInfo: "None:None",
      mglNames: "Chapter 1: Section 1"
    })
    expect(callType).toBe("small")
    expect(query).toContain("An Act")
    expect(query).toContain("bill text")
  })

  it("returns status -1 without calling the model when details are missing", async () => {
    expect(await getSummaryApiFunction("H1", "", "text")).toEqual({
      status: -1,
      summary: ""
    })
    expect(await getSummaryApiFunction("H1", "title", "")).toEqual({
      status: -1,
      summary: ""
    })
    expect(callLlmMock).not.toHaveBeenCalled()
  })
})

describe("getTagsApiFunctionV2", () => {
  it("only allows topics from the shared taxonomy", () => {
    expect(ALLOWED_TAGS.length).toBeGreaterThan(0)
    for (const tag of ALLOWED_TAGS)
      expect(CATEGORIES_BY_TOPIC[tag]).toBeTruthy()
  })

  it("lists every taxonomy topic in the prompt", async () => {
    respond("")
    await getTagsApiFunctionV2("H1", "An Act", "summary")
    const query = callLlmMock.mock.calls[0][1]
    for (const tag of ALLOWED_TAGS) expect(query).toContain(JSON.stringify(tag))
    expect(callLlmMock.mock.calls[0][2]).toBe("small")
  })

  it("drops hallucinated tags and duplicates, keeping the model's order", async () => {
    const [a, b] = ALLOWED_TAGS
    respond(` ${b} # Not A Real Tag # ${a} # ${b} #`)

    expect(await getTagsApiFunctionV2("H1", "An Act", "summary")).toEqual({
      status: 1,
      tags: [b, a]
    })
  })

  it("returns status -2 without calling the model when details are missing", async () => {
    expect(await getTagsApiFunctionV2("H1", "title", "")).toEqual({
      status: -2,
      tags: []
    })
    expect(callLlmMock).not.toHaveBeenCalled()
  })
})

describe("getTopicsForSummary", () => {
  it("attaches each tag's category", async () => {
    const tag = ALLOWED_TAGS[0]
    respond(tag)

    expect(await getTopicsForSummary("H1", "An Act", "summary")).toEqual({
      status: 1,
      topics: [{ topic: tag, category: CATEGORIES_BY_TOPIC[tag] }]
    })
  })
})
