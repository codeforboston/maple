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
