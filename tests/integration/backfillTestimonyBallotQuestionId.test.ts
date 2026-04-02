import { testDb, terminateFirebase } from "../testUtils"
import { script } from "../../scripts/firebase-admin/backfillTestimonyBallotQuestionId"

afterAll(async () => {
  await Promise.all([
    testDb
      .doc("users/backfill-test-user/publishedTestimony/legacy-pub")
      .delete(),
    testDb
      .doc("users/backfill-test-user/archivedTestimony/legacy-arch")
      .delete(),
    testDb
      .doc("users/backfill-test-user2/publishedTestimony/has-null")
      .delete(),
    testDb
      .doc("users/backfill-test-user2/publishedTestimony/has-value")
      .delete()
  ])
  await terminateFirebase()
})

it("sets ballotQuestionId: null on docs that are missing the field", async () => {
  const pub = testDb
    .collection("users")
    .doc("backfill-test-user")
    .collection("publishedTestimony")
    .doc("legacy-pub")
  const arch = testDb
    .collection("users")
    .doc("backfill-test-user")
    .collection("archivedTestimony")
    .doc("legacy-arch")

  await pub.set({ billId: "H1234", court: 193, content: "test" })
  await arch.set({ billId: "H1234", court: 193, version: 1 })

  await script({ db: testDb, args: { env: "local", argv: [] } } as any)

  expect((await pub.get()).data()?.ballotQuestionId).toBeNull()
  expect((await arch.get()).data()?.ballotQuestionId).toBeNull()
})

it("skips docs that already have ballotQuestionId set", async () => {
  const pub1 = testDb
    .collection("users")
    .doc("backfill-test-user2")
    .collection("publishedTestimony")
    .doc("has-null")
  const pub2 = testDb
    .collection("users")
    .doc("backfill-test-user2")
    .collection("publishedTestimony")
    .doc("has-value")

  await pub1.set({ ballotQuestionId: null, billId: "H1234", court: 193 })
  await pub2.set({ ballotQuestionId: "bq-123", billId: "H5678", court: 193 })

  await script({ db: testDb, args: { env: "local", argv: [] } } as any)

  expect((await pub1.get()).data()?.ballotQuestionId).toBeNull()
  expect((await pub2.get()).data()?.ballotQuestionId).toBe("bq-123")
})
