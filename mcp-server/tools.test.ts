import { shapeBill, shapeTestimony, shapeBallotQuestion } from "./tools"

/** Build a minimal fake Firestore document snapshot */
function makeDoc(id: string, data: Record<string, any>, distance?: number) {
  return {
    id,
    ref: { path: `courts/1/bills/${id}` },
    data: () => data,
    get: (field: string) => (field === "distance" ? distance : undefined)
  }
}

// ---------------------------------------------------------------------------
// shapeBill
// ---------------------------------------------------------------------------
describe("shapeBill", () => {
  const billData = {
    court: 193,
    content: {
      BillNumber: "H.1234",
      LegislationTypeName: "Bill",
      Title: "An Act relating to clean water",
      PrimarySponsor: { Name: "Jane Smith" },
      Pinslip: "Referred to committee",
      DocumentText: "Full statutory text here..."
    },
    summary: "A short summary",
    topics: ["Environment", "Water"],
    cosponsorCount: 5,
    endorseCount: 10,
    opposeCount: 2,
    neutralCount: 1,
    testimonyCount: 13,
    history: [
      { Date: "2024-01-01", Action: "Filed" },
      { Date: "2024-02-01", Action: "Referred to Committee" }
    ],
    similar: ["H.5678"],
    nextHearingAt: null,
    vector_embedding: [0.1, 0.2, 0.3]
  }

  it("returns core fields without full text by default", () => {
    const doc = makeDoc("H.1234", billData, 0.1)
    const result = shapeBill(doc, false) as any

    expect(result.id).toBe("H.1234")
    expect(result.billNumber).toBe("H.1234")
    expect(result.legislationType).toBe("Bill")
    expect(result.title).toBe("An Act relating to clean water")
    expect(result.primarySponsor).toBe("Jane Smith")
    expect(result.summary).toBe("A short summary")
    expect(result.pinslip).toBe("Referred to committee")
    expect(result.topics).toEqual(["Environment", "Water"])
    expect(result.cosponsorCount).toBe(5)
    expect(result.testimonyCount).toBe(13)
  })

  it("strips DocumentText when includeFullText is false", () => {
    const doc = makeDoc("H.1234", billData)
    const result = shapeBill(doc, false) as any
    expect(result.documentText).toBeUndefined()
  })

  it("includes DocumentText when includeFullText is true", () => {
    const doc = makeDoc("H.1234", billData)
    const result = shapeBill(doc, true) as any
    expect(result.documentText).toBe("Full statutory text here...")
  })

  it("strips vector_embedding", () => {
    const doc = makeDoc("H.1234", billData)
    const result = shapeBill(doc, false) as any
    expect(result.vector_embedding).toBeUndefined()
  })

  it("computes relevanceScore from cosine distance", () => {
    // distance = 0.1 → relevanceScore = 1 - 0.1 = 0.9
    const doc = makeDoc("H.1234", billData, 0.1)
    const result = shapeBill(doc, false) as any
    expect(result.relevanceScore).toBeCloseTo(0.9, 3)
  })

  it("returns null relevanceScore when distance is absent", () => {
    const doc = makeDoc("H.1234", billData, undefined)
    const result = shapeBill(doc, false) as any
    expect(result.relevanceScore).toBeNull()
  })

  it("sets latestAction to the last history entry", () => {
    const doc = makeDoc("H.1234", billData)
    const result = shapeBill(doc, false) as any
    expect(result.latestAction).toEqual({
      Date: "2024-02-01",
      Action: "Referred to Committee"
    })
  })

  it("returns null latestAction when history is empty", () => {
    const doc = makeDoc("H.0000", { ...billData, history: [] })
    const result = shapeBill(doc, false) as any
    expect(result.latestAction).toBeNull()
  })

  it("handles missing optional fields gracefully", () => {
    const minimalData = { content: {}, history: [] }
    const doc = makeDoc("H.0000", minimalData)
    const result = shapeBill(doc, false) as any

    expect(result.billNumber).toBeNull()
    expect(result.title).toBeNull()
    expect(result.primarySponsor).toBeNull()
    expect(result.summary).toBeNull()
    expect(result.topics).toEqual([])
    expect(result.cosponsorCount).toBe(0)
    expect(result.similar).toEqual([])
    expect(result.currentCommittee).toBeNull()
  })

  it("exposes currentCommittee id and name", () => {
    const data = {
      ...billData,
      currentCommittee: {
        id: "com-env",
        name: "Joint Committee on Environment",
        houseChair: null,
        senateChair: null
      }
    }
    const doc = makeDoc("H.1234", data)
    const result = shapeBill(doc, false) as any
    expect(result.currentCommittee).toEqual({
      id: "com-env",
      name: "Joint Committee on Environment"
    })
  })
})

// ---------------------------------------------------------------------------
// shapeTestimony
// ---------------------------------------------------------------------------
describe("shapeTestimony", () => {
  const testimonyData = {
    authorDisplayName: "Alice Advocate",
    authorRole: "org",
    billId: "H.1234",
    billTitle: "An Act relating to clean water",
    ballotQuestionId: null,
    court: 193,
    position: "endorse",
    publishedAt: "2024-03-01T12:00:00Z",
    public: true,
    content:
      "This bill is essential for protecting our waterways. " + "x".repeat(400)
  }

  it("returns core fields", () => {
    const doc = makeDoc("t1", testimonyData, 0.2)
    const result = shapeTestimony(doc, false) as any

    expect(result.id).toBe("t1")
    expect(result.authorDisplayName).toBe("Alice Advocate")
    expect(result.position).toBe("endorse")
    expect(result.billId).toBe("H.1234")
  })

  it("returns a 300-char preview when includeFullText is false", () => {
    const doc = makeDoc("t1", testimonyData)
    const result = shapeTestimony(doc, false) as any

    expect(result.content).toBeUndefined()
    expect(result.contentPreview).toBeDefined()
    expect(result.contentPreview!.length).toBeLessThanOrEqual(304) // 300 chars + ellipsis
    expect(result.contentPreview!.endsWith("…")).toBe(true)
  })

  it("does not append ellipsis when content is short", () => {
    const shortData = { ...testimonyData, content: "Short testimony." }
    const doc = makeDoc("t2", shortData)
    const result = shapeTestimony(doc, false) as any
    expect(result.contentPreview).toBe("Short testimony.")
    expect(result.contentPreview!.endsWith("…")).toBe(false)
  })

  it("returns full content when includeFullText is true", () => {
    const doc = makeDoc("t1", testimonyData)
    const result = shapeTestimony(doc, true) as any
    expect(result.content).toBe(testimonyData.content)
    expect(result.contentPreview).toBeUndefined()
  })

  it("strips vector_embedding", () => {
    const doc = makeDoc("t1", { ...testimonyData, vector_embedding: [0.1] })
    const result = shapeTestimony(doc, false) as any
    expect(result.vector_embedding).toBeUndefined()
  })

  it("does not expose the public flag in output", () => {
    const doc = makeDoc("t1", testimonyData)
    const result = shapeTestimony(doc, false) as any
    expect(result.public).toBeUndefined()
  })

  it("anonymizes author info when public === false", () => {
    const privateData = { ...testimonyData, public: false }
    const doc = makeDoc("t2", privateData)
    const result = shapeTestimony(doc, false) as any
    expect(result.authorDisplayName).toBe("Anonymous")
    expect(result.authorRole).toBeNull()
  })

  it("preserves author info when public === true", () => {
    const doc = makeDoc("t1", testimonyData)
    const result = shapeTestimony(doc, false) as any
    expect(result.authorDisplayName).toBe("Alice Advocate")
    expect(result.authorRole).toBe("org")
  })

  it("preserves content for private-profile testimony (public record)", () => {
    const privateData = { ...testimonyData, public: false }
    const doc = makeDoc("t2", privateData)
    const result = shapeTestimony(doc, true) as any
    expect(result.content).toBe(privateData.content)
  })

  it("computes relevanceScore correctly", () => {
    const doc = makeDoc("t1", testimonyData, 0.25)
    const result = shapeTestimony(doc, false) as any
    expect(result.relevanceScore).toBeCloseTo(0.75, 3)
  })
})

// ---------------------------------------------------------------------------
// shapeBallotQuestion
// ---------------------------------------------------------------------------
describe("shapeBallotQuestion", () => {
  const bqData = {
    title: "Question 1: Ranked Choice Voting",
    summary: "Adopt ranked choice voting for statewide elections",
    topics: ["Elections"],
    endorseCount: 100,
    opposeCount: 50,
    neutralCount: 10,
    testimonyCount: 160,
    fullText: "The full question text appears here...",
    vector_embedding: [0.5, 0.6]
  }

  it("returns core fields", () => {
    const doc = makeDoc("bq1", bqData, 0.05)
    const result = shapeBallotQuestion(doc, false) as any

    expect(result.id).toBe("bq1")
    expect(result.type).toBe("ballot_question")
    expect(result.title).toBe("Question 1: Ranked Choice Voting")
    expect(result.summary).toBe(
      "Adopt ranked choice voting for statewide elections"
    )
    expect(result.endorseCount).toBe(100)
    expect(result.testimonyCount).toBe(160)
  })

  it("strips full text when includeFullText is false", () => {
    const doc = makeDoc("bq1", bqData)
    const result = shapeBallotQuestion(doc, false) as any
    expect(result.fullText).toBeUndefined()
  })

  it("includes full text when includeFullText is true", () => {
    const doc = makeDoc("bq1", bqData)
    const result = shapeBallotQuestion(doc, true) as any
    expect(result.fullText).toBe("The full question text appears here...")
  })

  it("strips vector_embedding", () => {
    const doc = makeDoc("bq1", bqData)
    const result = shapeBallotQuestion(doc, false) as any
    expect(result.vector_embedding).toBeUndefined()
  })

  it("computes relevanceScore from cosine distance", () => {
    const doc = makeDoc("bq1", bqData, 0.05)
    const result = shapeBallotQuestion(doc, false) as any
    expect(result.relevanceScore).toBeCloseTo(0.95, 3)
  })
})

// ---------------------------------------------------------------------------
// list_sponsors, list_committees and the current court
// ---------------------------------------------------------------------------

/** Bills per court, and every field list a query selected. */
let mockBills: Record<number, Record<string, any>[]> = {}
const mockSelects: string[][] = []

// Hoisted by jest above the imports; only the shape tests above load ./tools
// without calling Firestore.
jest.mock("firebase-admin", () => ({
  firestore: () => ({ collection: mockCollection })
}))

function mockCollection(path: string) {
  if (path === "generalCourts")
    return {
      // Like Firestore, includes courts whose only data is in subcollections.
      listDocuments: async () => Object.keys(mockBills).map(id => ({ id }))
    }
  const bills = mockBills[Number(path.split("/")[1])] ?? []
  const docs = bills.map(data => ({
    get: (field: string) =>
      field.split(".").reduce((value: any, key) => value?.[key], data)
  }))
  const result = (n: number) => ({
    get: async () => ({ empty: !docs.length, docs: docs.slice(0, n) })
  })
  return {
    select: (...fields: string[]) => {
      mockSelects.push(fields)
      return { ...result(docs.length), limit: (n: number) => result(n) }
    }
  }
}

/** Calls a tool's handler as the MCP server would, with a fresh cache. */
function loadTool(name: string) {
  let handler: (args: object) => Promise<any> = async () => undefined
  jest.isolateModules(() => {
    require("./tools").registerTools({
      registerTool: (tool: string, _def: unknown, fn: typeof handler) => {
        if (tool === name) handler = fn
      }
    })
  })
  return async (args: object = {}) =>
    JSON.parse((await handler(args)).content[0].text)
}

const bill = (sponsor: string, committee?: string) => ({
  content: { PrimarySponsor: { Name: sponsor } },
  ...(committee && { currentCommittee: { name: committee } })
})

describe("list tools", () => {
  beforeEach(() => {
    delete process.env.CURRENT_COURT
    mockSelects.length = 0
  })

  it("lists the sponsors of every bill, reading only that field", async () => {
    // The first 1,000 bills by id are all House bills.
    mockBills = {
      194: [
        ...Array.from({ length: 1000 }, () => bill("Representative A")),
        bill("Senator B")
      ]
    }
    expect(await loadTool("list_sponsors")({ court: 194 })).toEqual([
      "Representative A",
      "Senator B"
    ])
    expect(mockSelects).toEqual([["content.PrimarySponsor.Name"]])
  })

  it("lists the committees of every bill", async () => {
    mockBills = {
      194: [
        ...Array.from({ length: 1000 }, () => bill("A", "Committee on X")),
        bill("B", "Committee on Y"),
        bill("C")
      ]
    }
    expect(await loadTool("list_committees")({ court: 194 })).toEqual([
      "Committee on X",
      "Committee on Y"
    ])
  })

  it("defaults to the newest court with bills", async () => {
    // 195 has data (e.g. members) but no bills yet.
    mockBills = { 193: [bill("Old")], 194: [bill("Current")], 195: [] }
    expect(await loadTool("list_sponsors")()).toEqual(["Current"])
  })

  it("uses CURRENT_COURT when it's set", async () => {
    process.env.CURRENT_COURT = "193"
    mockBills = { 193: [bill("Old")], 194: [bill("Current")] }
    expect(await loadTool("list_sponsors")()).toEqual(["Old"])
  })

  it("reads a session's list once every 12 hours", async () => {
    mockBills = { 194: [bill("Current")] }
    const now = jest.spyOn(Date, "now").mockReturnValue(0)
    const listSponsors = loadTool("list_sponsors")
    await listSponsors({ court: 194 })
    now.mockReturnValue(12 * 60 * 60 * 1000 - 1)
    await listSponsors({ court: 194 })
    expect(mockSelects).toHaveLength(1)
    now.mockReturnValue(12 * 60 * 60 * 1000)
    await listSponsors({ court: 194 })
    expect(mockSelects).toHaveLength(2)
    now.mockRestore()
  })
})
