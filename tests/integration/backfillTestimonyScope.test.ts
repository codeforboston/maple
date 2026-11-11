import { testDb, terminateFirebase } from "../testUtils"
import { script } from "../../scripts/firebase-admin/backfillTestimonyScope"

const user = testDb.collection("users").doc("backfill-scope-test-user")
const docs = {
  pub: user.collection("publishedTestimony").doc("legacy-pub"),
  arch: user.collection("archivedTestimony").doc("legacy-arch"),
  draft: user.collection("draftTestimony").doc("legacy-draft"),
  ballot: user.collection("publishedTestimony").doc("ballot-pub"),
  conference: user.collection("draftTestimony").doc("conference-draft")
}

const run = (args = {}) =>
  script({ db: testDb, args: { env: "local", argv: [], ...args } } as any)

beforeEach(async () => {
  await Promise.all([
    docs.pub.set({ billId: "H1234", court: 193 }),
    docs.arch.set({ billId: "H1234", court: 193, version: 1 }),
    docs.draft.set({ billId: "H1234", court: 193 }),
    docs.ballot.set({ billId: "H1234", court: 193, ballotQuestionId: "bq-1" }),
    docs.conference.set({ billId: "H1234", court: 193, conferenceId: "c-1" })
  ])
})

afterAll(async () => {
  await Promise.all(Object.values(docs).map(d => d.delete()))
  await terminateFirebase()
})

it("sets both scope fields to null on docs missing them", async () => {
  await run()

  for (const d of [docs.pub, docs.arch, docs.draft]) {
    const data = (await d.get()).data()
    expect(data).toHaveProperty("ballotQuestionId", null)
    expect(data).toHaveProperty("conferenceId", null)
  }
})

it("leaves fields that are already set", async () => {
  await run()

  const ballot = (await docs.ballot.get()).data()
  expect(ballot).toHaveProperty("ballotQuestionId", "bq-1")
  expect(ballot).toHaveProperty("conferenceId", null)
  const conference = (await docs.conference.get()).data()
  expect(conference).toHaveProperty("ballotQuestionId", null)
  expect(conference).toHaveProperty("conferenceId", "c-1")
})

it("writes nothing on a dry run", async () => {
  await run({ dryRun: true })

  for (const d of [docs.pub, docs.arch, docs.draft]) {
    const data = (await d.get()).data()
    expect(data).not.toHaveProperty("ballotQuestionId")
    expect(data).not.toHaveProperty("conferenceId")
  }
})
