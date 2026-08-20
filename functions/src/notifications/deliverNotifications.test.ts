import { buildDigestData } from "./deliverNotifications"
import { Timestamp } from "../firebase"

// Mock firebase module
jest.mock("../firebase", () => ({
  auth: {},
  db: {
    collection: jest.fn()
  },
  Timestamp: {
    fromDate: (d: Date) => ({ toDate: () => d, seconds: d.getTime() / 1000 }),
    now: () => ({ toDate: () => new Date() })
  }
}))

// Mock helpers
jest.mock("./helpers", () => ({
  getNotificationStartDate: jest.fn((_freq, now) => now),
  getNextDigestAt: jest.fn()
}))

// Mock handlebars helpers
jest.mock("../email/handlebarsHelpers", () => ({
  prepareHandlebars: jest.fn()
}))

const makeTimestamp = (d: Date) => ({
  toDate: () => d,
  seconds: d.getTime() / 1000
})

const makeNotificationDoc = (fields: object) => ({
  data: () => ({ notification: fields })
})

const mockDb = require("../firebase").db

const setupCollection = (docs: object[]) => {
  const get = jest
    .fn()
    .mockResolvedValue({ docs: docs.map(makeNotificationDoc) })
  const queryBuilder: { where: jest.Mock; get: jest.Mock } = {
    where: jest.fn(),
    get
  }
  queryBuilder.where.mockReturnValue(queryBuilder)
  mockDb.collection.mockReturnValue(queryBuilder)
}

const now = makeTimestamp(new Date("2025-03-01")) as unknown as typeof Timestamp

describe("buildDigestData — bills", () => {
  it("aggregates bill testimony by position", async () => {
    setupCollection([
      {
        type: "testimony",
        isBillMatch: true,
        isUserMatch: false,
        isBallotQuestionMatch: false,
        billId: "H1234",
        header: "A Bill",
        court: "193",
        position: "endorse",
        timestamp: now,
        authorUid: "user1",
        subheader: "Alice",
        bodyText: "",
        testimonyId: "t1",
        userRole: "user",
        delivered: false,
        ballotQuestionId: null,
        ballotQuestionCourt: null
      },
      {
        type: "testimony",
        isBillMatch: true,
        isUserMatch: false,
        isBallotQuestionMatch: false,
        billId: "H1234",
        header: "A Bill",
        court: "193",
        position: "oppose",
        timestamp: now,
        authorUid: "user2",
        subheader: "Bob",
        bodyText: "",
        testimonyId: "t2",
        userRole: "user",
        delivered: false,
        ballotQuestionId: null,
        ballotQuestionCourt: null
      }
    ])

    const result = await buildDigestData("uid1", now as any, "Weekly")

    expect(result.bills).toHaveLength(1)
    expect(result.bills[0]).toMatchObject({
      billId: "H1234",
      endorseCount: 1,
      opposeCount: 1,
      neutralCount: 0
    })
    expect(result.numBillsWithNewTestimony).toBe(1)
  })
})

describe("buildDigestData — ballot questions", () => {
  it("aggregates ballot question testimony by position", async () => {
    setupCollection([
      {
        type: "testimony",
        isBillMatch: false,
        isUserMatch: false,
        isBallotQuestionMatch: true,
        billId: "H0001",
        header: "Question 1: Should we do the thing?",
        court: "193",
        position: "endorse",
        timestamp: now,
        authorUid: "user1",
        subheader: "Alice",
        bodyText: "",
        testimonyId: "t1",
        userRole: "user",
        delivered: false,
        ballotQuestionId: "bq-1",
        ballotQuestionCourt: 193
      },
      {
        type: "testimony",
        isBillMatch: false,
        isUserMatch: false,
        isBallotQuestionMatch: true,
        billId: "H0001",
        header: "Question 1: Should we do the thing?",
        court: "193",
        position: "neutral",
        timestamp: now,
        authorUid: "user2",
        subheader: "Bob",
        bodyText: "",
        testimonyId: "t2",
        userRole: "user",
        delivered: false,
        ballotQuestionId: "bq-1",
        ballotQuestionCourt: 193
      }
    ])

    const result = await buildDigestData("uid1", now as any, "Weekly")

    expect(result.ballotQuestions).toHaveLength(1)
    expect(result.ballotQuestions[0]).toMatchObject({
      ballotQuestionId: "bq-1",
      description: "Question 1: Should we do the thing?",
      endorseCount: 1,
      neutralCount: 1,
      opposeCount: 0
    })
    expect(result.numBallotQuestionsWithNewTestimony).toBe(1)
  })

  it("caps ballot questions at 4 and reports full count", async () => {
    const bqDocs = Array.from({ length: 6 }, (_, i) => ({
      type: "testimony",
      isBillMatch: false,
      isUserMatch: false,
      isBallotQuestionMatch: true,
      billId: "H0001",
      header: `Question ${i + 1}`,
      court: "193",
      position: "endorse",
      timestamp: now,
      authorUid: `user${i}`,
      subheader: `User ${i}`,
      bodyText: "",
      testimonyId: `t${i}`,
      userRole: "user",
      delivered: false,
      ballotQuestionId: `bq-${i}`,
      ballotQuestionCourt: 193
    }))
    setupCollection(bqDocs)

    const result = await buildDigestData("uid1", now as any, "Weekly")

    expect(result.ballotQuestions).toHaveLength(4)
    expect(result.numBallotQuestionsWithNewTestimony).toBe(6)
  })

  it("returns empty ballot questions when there are no isBallotQuestionMatch notifications", async () => {
    setupCollection([
      {
        type: "testimony",
        isBillMatch: true,
        isUserMatch: false,
        isBallotQuestionMatch: false,
        billId: "H1234",
        header: "A Bill",
        court: "193",
        position: "endorse",
        timestamp: now,
        authorUid: "user1",
        subheader: "Alice",
        bodyText: "",
        testimonyId: "t1",
        userRole: "user",
        delivered: false,
        ballotQuestionId: null,
        ballotQuestionCourt: null
      }
    ])

    const result = await buildDigestData("uid1", now as any, "Weekly")

    expect(result.ballotQuestions).toHaveLength(0)
    expect(result.numBallotQuestionsWithNewTestimony).toBe(0)
  })

  it("skips ballot question notification if ballotQuestionId is null", async () => {
    setupCollection([
      {
        type: "testimony",
        isBillMatch: false,
        isUserMatch: false,
        isBallotQuestionMatch: true,
        billId: "H0001",
        header: "Question",
        court: "193",
        position: "endorse",
        timestamp: now,
        authorUid: "user1",
        subheader: "Alice",
        bodyText: "",
        testimonyId: "t1",
        userRole: "user",
        delivered: false,
        ballotQuestionId: null,
        ballotQuestionCourt: null
      }
    ])

    const result = await buildDigestData("uid1", now as any, "Weekly")

    expect(result.ballotQuestions).toHaveLength(0)
  })
})

describe("buildDigestData — users", () => {
  it("aggregates user testimony across bills", async () => {
    setupCollection([
      {
        type: "testimony",
        isBillMatch: false,
        isUserMatch: true,
        isBallotQuestionMatch: false,
        billId: "H1234",
        header: "A Bill",
        court: "193",
        position: "endorse",
        timestamp: now,
        authorUid: "author1",
        subheader: "Alice",
        bodyText: "",
        testimonyId: "t1",
        userRole: "user",
        delivered: false,
        ballotQuestionId: null,
        ballotQuestionCourt: null
      },
      {
        type: "testimony",
        isBillMatch: false,
        isUserMatch: true,
        isBallotQuestionMatch: false,
        billId: "H5678",
        header: "Another Bill",
        court: "193",
        position: "oppose",
        timestamp: now,
        authorUid: "author1",
        subheader: "Alice",
        bodyText: "",
        testimonyId: "t2",
        userRole: "user",
        delivered: false,
        ballotQuestionId: null,
        ballotQuestionCourt: null
      }
    ])

    const result = await buildDigestData("uid1", now as any, "Weekly")

    expect(result.users).toHaveLength(1)
    expect(result.users[0]).toMatchObject({
      userId: "author1",
      userName: "Alice",
      newTestimonyCount: 2
    })
    expect(result.users[0].bills).toHaveLength(2)
    expect(result.numUsersWithNewTestimony).toBe(1)
  })
})
