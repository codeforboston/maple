import { populateBallotQuestionNotificationEventsHandler } from "./populateBallotQuestionNotificationEvents"

jest.mock("firebase-functions", () => ({
  firestore: {
    document: jest.fn().mockReturnValue({ onWrite: jest.fn() })
  }
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

const makeBqData = (ballotStatus: string) => ({
  court: 194,
  ballotStatus,
  description: "A test ballot question"
})

const makeSnapshot = (before: object | null, after: object | null) => ({
  before: { exists: before !== null, data: () => before },
  after: { exists: after !== null, data: () => after }
})

const makeContext = (id = "25-01") => ({ params: { id } })

beforeEach(() => {
  jest.clearAllMocks()
})

describe("populateBallotQuestionNotificationEventsHandler", () => {
  it("does nothing when after snapshot does not exist", async () => {
    const snapshot = makeSnapshot(makeBqData("expectedOnBallot"), null)
    await populateBallotQuestionNotificationEventsHandler(
      snapshot as any,
      makeContext() as any
    )
    expect(mockDb.collection).not.toHaveBeenCalled()
  })

  it("does nothing when ballotStatus is unchanged", async () => {
    const snapshot = makeSnapshot(
      makeBqData("expectedOnBallot"),
      makeBqData("expectedOnBallot")
    )
    await populateBallotQuestionNotificationEventsHandler(
      snapshot as any,
      makeContext() as any
    )
    expect(mockDb.collection).not.toHaveBeenCalled()
  })

  it("creates a new notificationEvent when status changes and none exists", async () => {
    setupCollection(true)

    const snapshot = makeSnapshot(
      makeBqData("expectedOnBallot"),
      makeBqData("accepted")
    )
    await populateBallotQuestionNotificationEventsHandler(
      snapshot as any,
      makeContext() as any
    )

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "ballotQuestion",
        ballotQuestionId: "25-01",
        ballotQuestionCourt: 194,
        ballotStatus: "accepted",
        description: "A test ballot question"
      })
    )
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("updates existing notificationEvent when status changes and one exists", async () => {
    const existingDocId = "existing-event-id"
    setupCollection(false, [{ id: existingDocId }])

    const snapshot = makeSnapshot(
      makeBqData("expectedOnBallot"),
      makeBqData("rejected")
    )
    await populateBallotQuestionNotificationEventsHandler(
      snapshot as any,
      makeContext() as any
    )

    expect(mockDoc).toHaveBeenCalledWith(existingDocId)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        ballotStatus: "rejected",
        description: "A test ballot question"
      })
    )
    expect(mockAdd).not.toHaveBeenCalled()
  })
})
