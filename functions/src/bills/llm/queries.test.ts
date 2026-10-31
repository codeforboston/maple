import {
  extractCategoriesTags,
  formatTagList,
  getQueryForSummarization,
  getQueryForTagging,
  prepareInvokeDict
} from "./queries"
import {
  formatPrompt,
  SUMMARIZATION_PROMPT_LARGE,
  SUMMARIZATION_PROMPT_SMALL,
  TAGGING_PROMPT_USING_SUMMARIES
} from "./prompts"
import { emptyBillDetails } from "./types"

const bill = emptyBillDetails({
  billId: "H1",
  billTitle: "An Act {relative} to cats",
  billText: "First paragraph.\n\nSecond paragraph.",
  mglRef: "None",
  committeeInfo: "None:None",
  mglNames: "CHAPTER: Section",
  summary: "Cats would be allowed."
})

describe("prepareInvokeDict", () => {
  it("fences each chunk of bill text and MGL text", () => {
    expect(prepareInvokeDict(bill)).toEqual({
      title: "An Act {relative} to cats",
      context: "```First paragraph.\n\nSecond paragraph.```",
      names: "CHAPTER: Section",
      mgl_sections: "```None```",
      committee_info: "None:None"
    })
  })

  it("splits long bill text into separately fenced chunks", () => {
    const paragraph = "x".repeat(60000)
    const { context } = prepareInvokeDict({
      ...bill,
      billText: `${paragraph}\n\n${paragraph}`
    })
    expect(context).toBe(`\`\`\`${paragraph}\`\`\`\n\n\`\`\`${paragraph}\`\`\``)
  })

  it("has no context for empty text", () => {
    expect(prepareInvokeDict({ ...bill, billText: "" }).context).toBe("")
  })
})

describe("getQueryForSummarization", () => {
  it("fills the small template with fenced context", () => {
    expect(getQueryForSummarization(bill, "small")).toBe(
      formatPrompt(SUMMARIZATION_PROMPT_SMALL, prepareInvokeDict(bill))
    )
  })

  it("fills the large template with the unsplit bill and no MGL text", () => {
    const query = getQueryForSummarization(bill, "large")
    expect(query).toBe(
      formatPrompt(SUMMARIZATION_PROMPT_LARGE, {
        bill_title: bill.billTitle,
        bill_text: bill.billText,
        mgl_names: bill.mglNames,
        committee_info: bill.committeeInfo
      })
    )
    expect(query).toContain("The bill text is: First paragraph.")
  })
})

describe("getQueryForTagging", () => {
  it("fills the summary-based template with the allowed tags", () => {
    expect(
      getQueryForTagging(bill, ["Consumer protection", "Data privacy"])
    ).toBe(
      formatPrompt(TAGGING_PROMPT_USING_SUMMARIES, {
        bill_title: bill.billTitle,
        context: "```Cats would be allowed.```",
        tags: '["Consumer protection", "Data privacy"]'
      })
    )
  })
})

describe("formatTagList", () => {
  it("quotes tags so commas and quotes inside a tag stay unambiguous", () => {
    expect(
      formatTagList([
        "Social work, volunteer service, charitable organizations",
        'Municipality oversight and "home rule petitions"'
      ])
    ).toBe(
      '["Social work, volunteer service, charitable organizations", "Municipality oversight and \\"home rule petitions\\""]'
    )
  })
})

describe("extractCategoriesTags", () => {
  it("splits on # and trims", () => {
    expect(extractCategoriesTags("Category1 # Category2 #Tag1# Tag2 ")).toEqual(
      ["Category1", "Category2", "Tag1", "Tag2"]
    )
  })

  it("drops empty elements", () => {
    expect(extractCategoriesTags("A##B# ")).toEqual(["A", "B"])
    expect(extractCategoriesTags("")).toEqual([])
  })
})
