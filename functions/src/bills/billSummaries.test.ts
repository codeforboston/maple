import {
  normalizeSummary,
  parseTags,
  getSummary,
  getTags,
  runBillSummaryTrigger
} from "./billSummaries"

function makeOpenAIClient(responseContent: string | null) {
  return {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: responseContent } }]
        })
      }
    }
  } as any
}

function makeFailingOpenAIClient() {
  return {
    chat: {
      completions: {
        create: jest.fn().mockRejectedValue(new Error("API error"))
      }
    }
  } as any
}

function makeSequentialOpenAIClient(...responses: (string | null)[]) {
  const mock = jest.fn()
  for (const content of responses) {
    mock.mockResolvedValueOnce({
      choices: [{ message: { content } }]
    })
  }
  return {
    chat: { completions: { create: mock } }
  } as any
}

function makeSnapshot(
  data: Record<string, any> | undefined
): FirebaseFirestore.DocumentSnapshot {
  const ref = { update: jest.fn().mockResolvedValue(undefined) }
  return {
    data: () => data,
    ref
  } as any
}

describe("normalizeSummary", () => {
  it("strips leading Summary: prefix", () => {
    expect(normalizeSummary("Summary: This is a bill.")).toBe(
      "This is a bill."
    )
  })

  it("collapses bullet list formatting", () => {
    const input = "Summary:\n- Point one\n- Point two\n- Point three"
    expect(normalizeSummary(input)).toBe("Point one Point two Point three")
  })

  it("trims whitespace and removes empty lines", () => {
    const input = "  \n  Some text  \n\n  More text  \n  "
    expect(normalizeSummary(input)).toBe("Some text More text")
  })

  it("handles plain text without prefix", () => {
    expect(normalizeSummary("Just a summary.")).toBe("Just a summary.")
  })
})

describe("parseTags", () => {
  it("parses # separated tags and filters to known topics", () => {
    const response = "Consumer protection # Mental health # Fake topic"
    const result = parseTags(response)
    expect(result).toEqual(["Consumer protection", "Mental health"])
  })

  it("returns empty array for all unknown tags", () => {
    const result = parseTags("Unknown tag # Another fake")
    expect(result).toEqual([])
  })

  it("handles empty string", () => {
    expect(parseTags("")).toEqual([])
  })

  it("trims whitespace from tags", () => {
    const result = parseTags("  Consumer protection  #  Mental health  ")
    expect(result).toEqual(["Consumer protection", "Mental health"])
  })
})

describe("getSummary", () => {
  it("returns summary on successful API call", async () => {
    const client = makeOpenAIClient("Summary: This bill does something.")
    const result = await getSummary(client, "H1234", "Title", "Text")
    expect(result).toEqual({
      status: 1,
      summary: "This bill does something."
    })
    expect(client.chat.completions.create).toHaveBeenCalledTimes(1)
  })

  it("returns status -1 on empty API response", async () => {
    const client = makeOpenAIClient(null)
    const result = await getSummary(client, "H1234", "Title", "Text")
    expect(result).toEqual({ status: -1, summary: "" })
  })

  it("returns status -1 on API error", async () => {
    const client = makeFailingOpenAIClient()
    const result = await getSummary(client, "H1234", "Title", "Text")
    expect(result).toEqual({ status: -1, summary: "" })
  })
})

describe("getTags", () => {
  it("returns parsed tags on successful API call", async () => {
    const client = makeOpenAIClient(
      "Consumer protection # Mental health # Income tax"
    )
    const result = await getTags(client, "H1234", "Title", "A summary")
    expect(result.status).toBe(1)
    expect(result.tags).toEqual([
      "Consumer protection",
      "Mental health",
      "Income tax"
    ])
  })

  it("filters out unknown tags from response", async () => {
    const client = makeOpenAIClient(
      "Consumer protection # Completely made up tag"
    )
    const result = await getTags(client, "H1234", "Title", "A summary")
    expect(result.status).toBe(1)
    expect(result.tags).toEqual(["Consumer protection"])
  })

  it("returns status -2 on empty API response", async () => {
    const client = makeOpenAIClient(null)
    const result = await getTags(client, "H1234", "Title", "A summary")
    expect(result).toEqual({ status: -2, tags: [] })
  })

  it("returns status -2 on API error", async () => {
    const client = makeFailingOpenAIClient()
    const result = await getTags(client, "H1234", "Title", "A summary")
    expect(result).toEqual({ status: -2, tags: [] })
  })
})

describe("runBillSummaryTrigger", () => {
  const billContext = { params: { bill_id: "H1234" } }

  it("returns early when snapshot has no data", async () => {
    const snapshot = makeSnapshot(undefined)
    const client = makeOpenAIClient("unused")
    await runBillSummaryTrigger(snapshot, billContext, client)
    expect(snapshot.ref.update).not.toHaveBeenCalled()
  })

  it("returns early when content is missing DocumentText", async () => {
    const snapshot = makeSnapshot({
      content: { Title: "A title" }
    })
    const client = makeOpenAIClient("unused")
    await runBillSummaryTrigger(snapshot, billContext, client)
    expect(snapshot.ref.update).not.toHaveBeenCalled()
  })

  it("returns early when content is missing Title", async () => {
    const snapshot = makeSnapshot({
      content: { DocumentText: "Some text" }
    })
    const client = makeOpenAIClient("unused")
    await runBillSummaryTrigger(snapshot, billContext, client)
    expect(snapshot.ref.update).not.toHaveBeenCalled()
  })

  it("does nothing when summary and topics already exist", async () => {
    const snapshot = makeSnapshot({
      content: { Title: "Title", DocumentText: "Text" },
      summary: "Existing summary",
      topics: [{ category: "Commerce", topic: "Consumer protection" }]
    })
    const client = makeOpenAIClient("unused")
    await runBillSummaryTrigger(snapshot, billContext, client)
    expect(snapshot.ref.update).not.toHaveBeenCalled()
  })

  it("generates summary and topics when both are missing", async () => {
    const client = makeSequentialOpenAIClient(
      "Summary: A new summary",
      "Consumer protection # Mental health # Income tax"
    )

    const snapshot = makeSnapshot({
      content: { Title: "Bill Title", DocumentText: "Bill text content" }
    })

    await runBillSummaryTrigger(snapshot, billContext, client)

    // Should have called update twice: once for summary, once for topics
    expect(snapshot.ref.update).toHaveBeenCalledTimes(2)
    expect(snapshot.ref.update).toHaveBeenCalledWith({
      summary: "A new summary"
    })
    expect(snapshot.ref.update).toHaveBeenCalledWith({
      topics: expect.arrayContaining([
        expect.objectContaining({ topic: "Consumer protection" }),
        expect.objectContaining({ topic: "Mental health" }),
        expect.objectContaining({ topic: "Income tax" })
      ])
    })
  })

  it("returns early when summary generation fails", async () => {
    const client = makeFailingOpenAIClient()

    const snapshot = makeSnapshot({
      content: { Title: "Bill Title", DocumentText: "Bill text content" }
    })

    await runBillSummaryTrigger(snapshot, billContext, client)
    expect(snapshot.ref.update).not.toHaveBeenCalled()
  })

  it("generates topics when summary exists but topics are missing", async () => {
    const client = makeOpenAIClient(
      "Consumer protection # Mental health"
    )

    const snapshot = makeSnapshot({
      content: { Title: "Bill Title", DocumentText: "Bill text content" },
      summary: "Existing summary"
    })

    await runBillSummaryTrigger(snapshot, billContext, client)

    // Should only call update once for topics (summary already exists)
    expect(snapshot.ref.update).toHaveBeenCalledTimes(1)
    expect(snapshot.ref.update).toHaveBeenCalledWith({
      topics: expect.arrayContaining([
        expect.objectContaining({ topic: "Consumer protection" }),
        expect.objectContaining({ topic: "Mental health" })
      ])
    })
  })

  it("does not write topics when tag generation fails", async () => {
    const client = makeFailingOpenAIClient()

    const snapshot = makeSnapshot({
      content: { Title: "Bill Title", DocumentText: "Bill text content" },
      summary: "Existing summary"
    })

    await runBillSummaryTrigger(snapshot, billContext, client)
    expect(snapshot.ref.update).not.toHaveBeenCalled()
  })
})
