import path from "path"
import { testDb, terminateFirebase } from "../testUtils"
import { script } from "../../scripts/firebase-admin/syncBallotQuestions"

const FIXTURES_DIR = path.resolve(__dirname, "../fixtures/ballotQuestions")
const TEST_ID = "test-99-99"

afterAll(async () => {
  await testDb.collection("ballotQuestions").doc(TEST_ID).delete()
  await terminateFirebase()
})

it("syncs YAML files to Firestore", async () => {
  await script({
    db: testDb,
    args: { env: "local", argv: [], dir: FIXTURES_DIR },
  } as any)

  const snap = await testDb.collection("ballotQuestions").doc(TEST_ID).get()
  expect(snap.exists).toBe(true)
  expect(snap.data()?.billId).toBe("H5099")
  expect(snap.data()?.electionYear).toBe(2099)
})

it("can query by electionYear", async () => {
  const results = await testDb
    .collection("ballotQuestions")
    .where("electionYear", "==", 2099)
    .get()
  expect(results.docs.length).toBeGreaterThanOrEqual(1)
  expect(results.docs[0].data().id).toBe(TEST_ID)
})
