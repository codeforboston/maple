import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { testDb, terminateFirebase } from "../testUtils"
import { createNewBill, deleteBill } from "./common"
import { script } from "../../scripts/firebase-admin/syncConferences"
import {
  getConferenceForBill,
  getConferenceForHearing,
  listConferences
} from "../../components/db/conferences"

const FIXTURES_DIR = path.resolve(__dirname, "../fixtures/conferences")
const COURT = 194
const conference = (id: string) =>
  testDb.doc(`generalCourts/${COURT}/conferences/${id}`)

let dir: string
const run = (extra: object = {}) =>
  script({
    db: testDb,
    args: { env: "local", argv: [], dir, ...extra }
  } as any)

const editFixture = (from: string, to: string) => {
  const file = path.join(dir, "194/test-conference.yaml")
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace(from, to))
}

beforeAll(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "conferences-"))
  fs.cpSync(FIXTURES_DIR, dir, { recursive: true })
  await Promise.all([
    createNewBill({ id: "S9901" }),
    createNewBill({ id: "H9901" }),
    // A document from a conference no longer in YAML
    conference("stale-conference").set({ id: "stale-conference", court: COURT })
  ])
})

afterAll(async () => {
  await Promise.all([
    deleteBill("S9901"),
    deleteBill("H9901"),
    conference("test-conference").delete(),
    conference("stale-conference").delete()
  ])
  fs.rmSync(dir, { recursive: true, force: true })
  await terminateFirebase()
})

it("writes the document from YAML", async () => {
  const plan = await run()
  expect(plan.warnings).toEqual(
    expect.arrayContaining([expect.stringContaining("member TST1 not found")])
  )
  expect(plan.warnings).not.toEqual(
    expect.arrayContaining([expect.stringContaining("bills")])
  )

  const doc = (await conference("test-conference").get()).data()
  expect(doc?.title).toBe("Test conference committee")
  expect(doc?.name).toBe("Test Conference")
  expect(doc?.conferees.map((c: any) => c.chair === true)).toEqual([
    true,
    false,
    false,
    true,
    false,
    false
  ])
  expect(doc?.senateBillId).toBe("S9901")
  expect(doc?.houseBillId).toBe("H9901")
  expect(doc?.hearingIds).toEqual(["hearing-9901"])
  expect(doc?.differences).toHaveLength(1)
  expect(doc?.differences[0].source.organisation).toBe("Example Gazette")
  expect(doc?.similarities).toHaveLength(1)
  expect(doc?.passSenateVersionCount).toBe(0)
})

it("is found from either bill without a pointer on the bill", async () => {
  const bill = await testDb.doc(`generalCourts/${COURT}/bills/S9901`).get()
  expect(bill.data()).not.toHaveProperty("conferenceId")
  expect((await getConferenceForBill(COURT, "S9901"))?.id).toBe(
    "test-conference"
  )
  expect((await getConferenceForBill(COURT, "H9901"))?.id).toBe(
    "test-conference"
  )
  expect(await getConferenceForBill(COURT, "H0000")).toBeUndefined()
  expect((await listConferences(COURT)).map(c => c.id)).toContain(
    "test-conference"
  )
})

it("is found from a hearing it links", async () => {
  expect((await getConferenceForHearing(COURT, "hearing-9901"))?.id).toBe(
    "test-conference"
  )
  expect(await getConferenceForHearing(COURT, "hearing-0000")).toBeUndefined()
})

it("deletes documents that are no longer in YAML", async () => {
  expect((await conference("stale-conference").get()).exists).toBe(false)
})

it("keeps the runtime counts across a resync", async () => {
  await conference("test-conference").update({ passSenateVersionCount: 5 })
  await run()
  const doc = (await conference("test-conference").get()).data()
  expect(doc?.passSenateVersionCount).toBe(5)
  expect(doc?.title).toBe("Test conference committee")
})

it("writes nothing on a dry run", async () => {
  await conference("test-conference").update({ title: "edited by hand" })
  const plan = await run({ dryRun: true })
  expect(plan.set).toHaveLength(1)
  const doc = (await conference("test-conference").get()).data()
  expect(doc?.title).toBe("edited by hand")
})

it("warns about a bill that has not been scraped", async () => {
  editFixture("houseBillId: H9901", "houseBillId: H9999")
  const plan = await run({ dryRun: true })
  expect(plan.warnings).toEqual(
    expect.arrayContaining([expect.stringContaining("bills/H9999 not found")])
  )
})

it("refuses a canonical bill that is neither of the pair", async () => {
  const errors = jest.spyOn(console, "error").mockImplementation(() => {})
  editFixture("canonicalBillId: S9901", "canonicalBillId: S0000")
  await expect(run()).rejects.toThrow(/nothing written/)
  expect(errors).toHaveBeenCalledWith(
    expect.stringContaining("canonicalBillId")
  )
  errors.mockRestore()
  const doc = (await conference("test-conference").get()).data()
  expect(doc?.title).toBe("edited by hand")
  editFixture("canonicalBillId: S0000", "canonicalBillId: S9901")
})

it("refuses a file whose name or folder disagrees with its id or court", async () => {
  const errors = jest.spyOn(console, "error").mockImplementation(() => {})
  editFixture("id: test-conference", "id: renamed-conference")
  await expect(run()).rejects.toThrow(/nothing written/)
  editFixture("id: renamed-conference", "id: test-conference")
  editFixture("court: 194", "court: 195")
  await expect(run()).rejects.toThrow(/nothing written/)
  expect(errors.mock.calls.flat()).toEqual([
    expect.stringContaining("belongs at 194/renamed-conference.yaml"),
    expect.stringContaining("belongs at 195/test-conference.yaml")
  ])
  errors.mockRestore()
  const doc = (await conference("test-conference").get()).data()
  expect(doc?.title).toBe("edited by hand")
})
