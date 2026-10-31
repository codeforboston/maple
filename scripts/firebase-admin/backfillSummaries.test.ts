import {
  getSummaryApiFunction,
  getTopicsForSummary
} from "functions/src/bills/llm/api"
import {
  BackfillBillDoc,
  backfillSummaries,
  parseBillIds,
  rowsToCsv
} from "./backfillSummaries"

jest.mock("functions/src/bills/llm/api", () => ({
  getSummaryApiFunction: jest.fn(),
  getTopicsForSummary: jest.fn()
}))

const getSummary = getSummaryApiFunction as jest.MockedFunction<
  typeof getSummaryApiFunction
>
const getTopics = getTopicsForSummary as jest.MockedFunction<
  typeof getTopicsForSummary
>

const consumerProtection = {
  topic: "Consumer protection",
  category: "Commerce"
}

const makeBill = (data: Record<string, any>) => {
  const update = jest.fn(async (_data: Record<string, unknown>) => undefined)
  const doc: BackfillBillDoc = {
    id: data.id,
    data: () => data,
    ref: { update }
  }
  return { doc, update }
}

const makeDb = (docs: BackfillBillDoc[]) => {
  const collection = jest.fn((_path: string) => ({
    get: async () => ({ docs })
  }))
  return { db: { collection }, collection }
}

const HEADER = ["bill_id", "status", "summary", "topics"]
const content = { Title: "Title", DocumentText: "Text" }

beforeEach(() => {
  jest.resetAllMocks()
  getSummary.mockResolvedValue({ status: 1, summary: "New summary" })
  getTopics.mockResolvedValue({ status: 1, topics: [consumerProtection] })
})

describe("backfillSummaries", () => {
  it("skips bills without text", async () => {
    const bill = makeBill({ id: "H18", content: { Title: "No text" } })

    const rows = await backfillSummaries(makeDb([bill.doc]).db)

    expect(rows).toEqual([HEADER, ["H18", "skipped", "None", "None"]])
    expect(bill.update).not.toHaveBeenCalled()
  })

  it("generates topics when the summary exists", async () => {
    const bill = makeBill({ id: "H1", content, summary: "Existing summary" })

    const rows = await backfillSummaries(makeDb([bill.doc]).db)

    expect(rows[1]).toEqual(["H1", "previous_summary", "None", "None"])
    expect(rows[2].slice(0, 3)).toEqual([
      "H1",
      "generated_summary_and_topics",
      "Existing summary"
    ])
    expect(getSummary).not.toHaveBeenCalled()
    expect(bill.update.mock.calls).toEqual([[{ topics: [consumerProtection] }]])
  })

  it("generates and writes both for a bill with neither", async () => {
    const bill = makeBill({ id: "H1", content })

    const rows = await backfillSummaries(makeDb([bill.doc]).db)

    expect(rows[1].slice(0, 3)).toEqual([
      "H1",
      "generated_summary_and_topics",
      "New summary"
    ])
    expect(JSON.parse(rows[1][3])).toEqual([consumerProtection])
    expect(bill.update.mock.calls).toEqual([
      [{ summary: "New summary" }],
      [{ topics: [consumerProtection] }]
    ])
  })

  it("avoids Firestore updates on a dry run", async () => {
    const bill = makeBill({ id: "H1", content })

    const rows = await backfillSummaries(makeDb([bill.doc]).db, {
      dryRun: true
    })

    expect(rows[1].slice(0, 3)).toEqual([
      "H1",
      "generated_summary_and_topics",
      "New summary"
    ])
    expect(bill.update).not.toHaveBeenCalled()
  })

  it("reports previous topics without regenerating them", async () => {
    const bill = makeBill({
      id: "H1",
      content,
      summary: "s",
      topics: [consumerProtection]
    })

    const rows = await backfillSummaries(makeDb([bill.doc]).db)

    expect(rows.slice(1).map(r => r[1])).toEqual([
      "previous_summary",
      "previous_topics"
    ])
    expect(getTopics).not.toHaveBeenCalled()
    expect(bill.update).not.toHaveBeenCalled()
  })

  it("reports failed summaries and topics", async () => {
    const a = makeBill({ id: "H1", content })
    const b = makeBill({ id: "H2", content, summary: "kept" })
    getSummary.mockResolvedValue({ status: -1, summary: "" })
    getTopics.mockResolvedValue({ status: -2, topics: [] })

    const rows = await backfillSummaries(makeDb([a.doc, b.doc]).db)

    expect(rows.slice(1)).toEqual([
      ["H1", "failed_summary", "None", "None"],
      ["H2", "previous_summary", "None", "None"],
      ["H2", "failed_topics", "kept", "None"]
    ])
    expect(a.update).not.toHaveBeenCalled()
    expect(b.update).not.toHaveBeenCalled()
  })

  it("reads the requested court and filters by bill id", async () => {
    const a = makeBill({ id: "H1", content: {} })
    const b = makeBill({ id: "H2", content: {} })
    const { db, collection } = makeDb([a.doc, b.doc])

    const rows = await backfillSummaries(db, {
      court: 193,
      billIds: new Set(["H2"])
    })

    expect(collection).toHaveBeenCalledWith("generalCourts/193/bills")
    expect(rows.slice(1).map(r => r[0])).toEqual(["H2"])
  })
})

describe("parseBillIds", () => {
  it("accepts spaces and commas", () => {
    expect(parseBillIds("H1 H18,S2539")).toEqual(
      new Set(["H1", "H18", "S2539"])
    )
  })

  it("returns null when there are no ids", () => {
    expect(parseBillIds(undefined)).toBeNull()
    expect(parseBillIds(" , ")).toBeNull()
  })
})

describe("rowsToCsv", () => {
  it("quotes cells containing commas, quotes and newlines", () => {
    expect(rowsToCsv([["a", 'b,"c"', "d\ne"]])).toBe('a,"b,""c""","d\ne"\r\n')
  })
})
