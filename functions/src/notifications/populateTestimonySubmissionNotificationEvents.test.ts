import { populateTestimonySubmissionNotificationEventsHandler } from "./populateTestimonySubmissionNotificationEvents"

jest.mock("firebase-functions/v2/firestore", () => ({
  onDocumentWritten: jest.fn()
}))

jest.mock("../firebase", () => ({
  db: {
    collection: jest.fn()
  },
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1000 }))
  }
}))

const mockDb = require("../firebase").db

const mockAdd = jest.fn().mockResolvedValue({})
const mockUpdate = jest.fn().mockResolvedValue({})
const mockDoc = jest.fn().mockReturnValue({ update: mockUpdate })

const setupCollection = (empty: boolean, docs: { id: string }[] = []) => {
  const query = {
    where: jest.fn(),
    get: jest.fn().mockResolvedValue({ empty, docs }),
    add: mockAdd,
    doc: mockDoc
  }
  query.where.mockReturnValue(query)
  mockDb.collection.mockReturnValue(query)
}

const makeTestimony = (overrides: object = {}) => ({
  court: 194,
  billId: "H1234",
  billTitle: "An Act relative to testing",
  authorUid: "author-uid",
  authorRole: "user",
  fullName: "Test Author",
  position: "endorse",
  content: "Testimony content",
  version: 1,
  ...overrides
})

const makeSnapshot = (before: object | null, after: object | null) => ({
  before: { exists: before !== null, data: () => before },
  after: { exists: after !== null, data: () => after }
})

const makeEvent = (before: object | null, after: object | null) => ({
  data: makeSnapshot(before, after),
  params: { userId: "author-uid", testimonyId: "testimony-id" }
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe("populateTestimonySubmissionNotificationEventsHandler", () => {
  it("creates a notificationEvent for new testimony", async () => {
    setupCollection(true)

    const event = makeEvent(null, makeTestimony())
    await populateTestimonySubmissionNotificationEventsHandler(event as any)

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "testimony",
        billCourt: "194",
        billId: "H1234",
        billName: "An Act relative to testing",
        userId: "author-uid",
        testimonyId: "testimony-id",
        testimonyVersion: 1
      })
    )
  })

  it.each(["billTitle", "court", "authorUid"])(
    "skips new testimony missing %s",
    async field => {
      setupCollection(true)

      const event = makeEvent(null, makeTestimony({ [field]: undefined }))
      await populateTestimonySubmissionNotificationEventsHandler(event as any)

      expect(mockAdd).not.toHaveBeenCalled()
    }
  )

  it("does nothing when the version is unchanged", async () => {
    const event = makeEvent(makeTestimony(), makeTestimony({ cosignCount: 1 }))
    await populateTestimonySubmissionNotificationEventsHandler(event as any)

    expect(mockDb.collection).not.toHaveBeenCalled()
  })

  it("updates an existing notificationEvent when the version changes", async () => {
    const existingDocId = "existing-event-id"
    setupCollection(false, [{ id: existingDocId }])

    const event = makeEvent(
      makeTestimony(),
      makeTestimony({ version: 2, content: "Edited content" })
    )
    await populateTestimonySubmissionNotificationEventsHandler(event as any)

    expect(mockDoc).toHaveBeenCalledWith(existingDocId)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        testimonyContent: "Edited content",
        testimonyVersion: 2
      })
    )
  })
})
