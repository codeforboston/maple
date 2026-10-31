import { getSummaryApiFunction, getTopicsForSummary } from "./api"
import { BillSnapshot, processNewBill } from "./generateBillSummaryAndTags"

jest.mock("./api")

const getSummary = getSummaryApiFunction as jest.MockedFunction<
  typeof getSummaryApiFunction
>
const getTopics = getTopicsForSummary as jest.MockedFunction<
  typeof getTopicsForSummary
>

const topic = {
  topic: "Budget process",
  category: "Economics and Public Finance"
}

const setup = (
  bill: Record<string, any> | undefined,
  overrides: Partial<{ summaryStatus: 1 | -1; topicStatus: 1 | -2 }> = {}
) => {
  const update = jest.fn(async (_data: Record<string, unknown>) => undefined)
  const snapshot: BillSnapshot = { data: () => bill, ref: { update } }
  getSummary.mockResolvedValue({
    status: overrides.summaryStatus ?? 1,
    summary: "new summary"
  })
  getTopics.mockResolvedValue({
    status: overrides.topicStatus ?? 1,
    topics: [topic]
  })
  return { snapshot, update, getSummary, getTopics }
}

beforeEach(() => jest.resetAllMocks())

const content = { Title: "An Act", DocumentText: "text" }

describe("processNewBill", () => {
  it("does nothing without event data or content", async () => {
    const a = setup({})
    await processNewBill("H1", undefined)
    const b = setup(undefined)
    await processNewBill("H1", b.snapshot)
    expect(a.getSummary).not.toHaveBeenCalled()
    expect(b.getSummary).not.toHaveBeenCalled()
    expect(b.update).not.toHaveBeenCalled()
  })

  it("stops when the title or text is missing", async () => {
    for (const c of [{ Title: "t" }, { DocumentText: "d" }, undefined]) {
      const t = setup({ content: c })
      await processNewBill("H1", t.snapshot)
      expect(t.getSummary).not.toHaveBeenCalled()
      expect(t.update).not.toHaveBeenCalled()
    }
  })

  it("writes the summary, then topics, for a new bill", async () => {
    const t = setup({ content })
    await processNewBill("H1", t.snapshot)

    expect(t.getSummary).toHaveBeenCalledWith("H1", "An Act", "text")
    expect(t.getTopics).toHaveBeenCalledWith("H1", "An Act", "new summary")
    expect(t.update.mock.calls).toEqual([
      [{ summary: "new summary" }],
      [{ topics: [topic] }]
    ])
  })

  it("stops without writing when the summary fails", async () => {
    const t = setup({ content }, { summaryStatus: -1 })
    await processNewBill("H1", t.snapshot)
    expect(t.update).not.toHaveBeenCalled()
    expect(t.getTopics).not.toHaveBeenCalled()
  })

  it("only generates topics when the summary already exists", async () => {
    const t = setup({ summary: "existing", content })
    await processNewBill("H1", t.snapshot)

    expect(t.getSummary).not.toHaveBeenCalled()
    expect(t.getTopics).toHaveBeenCalledWith("H1", "An Act", "existing")
    expect(t.update.mock.calls).toEqual([[{ topics: [topic] }]])
  })

  it("stops after the summary when topics already exist", async () => {
    const t = setup({ content, topics: [] })
    await processNewBill("H1", t.snapshot)

    expect(t.update.mock.calls).toEqual([[{ summary: "new summary" }]])
    expect(t.getTopics).not.toHaveBeenCalled()
  })

  it("leaves a fully populated bill alone", async () => {
    const t = setup({ summary: "s", topics: [topic], content })
    await processNewBill("H1", t.snapshot)
    expect(t.getSummary).not.toHaveBeenCalled()
    expect(t.getTopics).not.toHaveBeenCalled()
    expect(t.update).not.toHaveBeenCalled()
  })

  it("does not write topics when tagging fails", async () => {
    const t = setup({ summary: "s", content }, { topicStatus: -2 })
    await processNewBill("H1", t.snapshot)
    expect(t.update).not.toHaveBeenCalled()
  })
})
