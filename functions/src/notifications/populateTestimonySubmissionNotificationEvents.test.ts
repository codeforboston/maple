import { populateTestimonySubmissionNotificationEventsHandler } from "./populateTestimonySubmissionNotificationEvents"

jest.mock("firebase-functions/v2/firestore", () => ({
  onDocumentWritten: jest.fn()
}))

jest.mock("firebase-functions/logger", () => ({
  error: jest.fn()
}))

// The Testimony type needs the admin package's own Timestamp class.
jest.mock("../firebase", () => ({
  db: {
    collection: jest.fn(),
    doc: jest.fn()
  },
  Timestamp: jest.requireActual("firebase-admin/firestore").Timestamp
}))

const mockDb = require("../firebase").db
const mockLogger = require("firebase-functions/logger")

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

/** The conference document the event names its conference from. */
const setupConference = (data: object | undefined) =>
  mockDb.doc.mockReturnValue({
    get: jest.fn().mockResolvedValue({ data: () => data })
  })

/** Documents the handler reads, by path; any other path is missing. */
const setupDocs = (byPath: Record<string, object>) =>
  mockDb.doc.mockImplementation((path: string) => ({
    get: jest.fn().mockResolvedValue({ data: () => byPath[path] })
  }))

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

  it("names the conference on conference testimony", async () => {
    setupCollection(true)
    setupConference({ name: "Phone-Free Schools", title: "An Act relative" })

    const event = makeEvent(
      null,
      makeTestimony({ conferenceId: "phones", position: "passSomething" })
    )
    await populateTestimonySubmissionNotificationEventsHandler(event as any)

    expect(mockDb.doc).toHaveBeenCalledWith(
      "/generalCourts/194/conferences/phones"
    )
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        conferenceId: "phones",
        conferenceName: "Phone-Free Schools"
      })
    )
  })

  it("falls back to the conference's title, then to no name", async () => {
    setupCollection(true)
    setupConference({ title: "An Act relative to phones" })
    const testimony = makeTestimony({
      conferenceId: "phones",
      position: "passSomething"
    })
    await populateTestimonySubmissionNotificationEventsHandler(
      makeEvent(null, testimony) as any
    )
    expect(mockAdd).toHaveBeenLastCalledWith(
      expect.objectContaining({ conferenceName: "An Act relative to phones" })
    )

    setupConference(undefined)
    await populateTestimonySubmissionNotificationEventsHandler(
      makeEvent(null, testimony) as any
    )
    expect(mockAdd).toHaveBeenLastCalledWith(
      expect.objectContaining({ conferenceId: "phones", conferenceName: null })
    )
  })

  it("names no conference on bill testimony", async () => {
    setupCollection(true)

    await populateTestimonySubmissionNotificationEventsHandler(
      makeEvent(null, makeTestimony()) as any
    )

    expect(mockDb.doc).not.toHaveBeenCalled()
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({ conferenceId: null, conferenceName: null })
    )
  })

  describe("on a cosign", () => {
    const cosign = (content = "") =>
      makeTestimony({
        conferenceId: "phones",
        position: "passSomething",
        content,
        cosignOfId: "lead-id",
        cosignOfAuthorUid: "lead-uid"
      })

    it("carries the input it cosigns, credited to its author", async () => {
      setupCollection(true)
      setupDocs({
        "/generalCourts/194/conferences/phones": { name: "Phone-Free Schools" },
        "/users/lead-uid/publishedTestimony/lead-id": {
          fullName: "Lead Author",
          content: "Keep phones out of classrooms."
        }
      })

      await populateTestimonySubmissionNotificationEventsHandler(
        makeEvent(null, cosign()) as any
      )

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          conferenceName: "Phone-Free Schools",
          testimonyContent: "",
          cosignOf: {
            id: "lead-id",
            authorUid: "lead-uid",
            authorName: "Lead Author",
            content: "Keep phones out of classrooms."
          }
        })
      )
    })

    it("still goes out when the cosigned input is gone", async () => {
      setupCollection(true)
      setupDocs({})

      await populateTestimonySubmissionNotificationEventsHandler(
        makeEvent(null, cosign("My own line.")) as any
      )

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          testimonyContent: "My own line.",
          cosignOf: null
        })
      )
    })
  })

  it("reads nothing more for testimony that cosigns nothing", async () => {
    setupCollection(true)
    setupConference({ name: "Phone-Free Schools" })

    await populateTestimonySubmissionNotificationEventsHandler(
      makeEvent(
        null,
        makeTestimony({ conferenceId: "phones", position: "passSomething" })
      ) as any
    )

    expect(mockDb.doc).toHaveBeenCalledTimes(1)
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({ cosignOf: null })
    )
  })

  it.each(["court", "authorUid", "billId", "position", "content", "version"])(
    "logs an error and skips new testimony missing %s",
    async field => {
      setupCollection(true)

      const event = makeEvent(null, makeTestimony({ [field]: undefined }))
      await populateTestimonySubmissionNotificationEventsHandler(event as any)

      expect(mockAdd).not.toHaveBeenCalled()
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("testimony-id")
      )
    }
  )

  it("logs an error and skips an empty document", async () => {
    setupCollection(true)

    const event = makeEvent(null, {})
    await populateTestimonySubmissionNotificationEventsHandler(event as any)

    expect(mockAdd).not.toHaveBeenCalled()
    expect(mockLogger.error).toHaveBeenCalledTimes(1)
  })

  it("fills in a missing billTitle, as the Testimony type does", async () => {
    setupCollection(true)

    // Firestore omits a missing field rather than returning undefined.
    const { billTitle, ...withoutTitle } = makeTestimony()
    const event = makeEvent(null, withoutTitle)
    await populateTestimonySubmissionNotificationEventsHandler(event as any)

    expect(mockLogger.error).not.toHaveBeenCalled()
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({ billName: "" })
    )
  })

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
