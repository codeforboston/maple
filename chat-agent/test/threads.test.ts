import { readFileSync } from "fs"
import { join } from "path"
import { PGlite } from "@electric-sql/pglite"
import { vector } from "@electric-sql/pglite-pgvector"
import {
  claimRun,
  createThread,
  getThread,
  isCancelRequested,
  listThreads,
  releaseRun,
  requestCancel
} from "../src/threads"

const A = "uidA4444444444444444444441"
const B = "uidA4444444444444444444442"

let pg: PGlite
beforeAll(async () => {
  pg = new PGlite({ extensions: { vector } })
  await pg.exec(readFileSync(join(__dirname, "../sql/001_schema.sql"), "utf8"))
}, 60_000)
afterAll(() => pg.close())

test("threads: create, get, and list only the owner's, newest first", async () => {
  const older = await createThread(pg, A, "older")
  const newer = await createThread(pg, A, "x".repeat(80))
  await createThread(pg, B, "someone else's")
  await pg.query(
    `update chat_threads set updated_at = now() - interval '1 hour' where id = $1`,
    [older]
  )

  const list = await listThreads(pg, A)
  expect(list.map(t => t.id)).toEqual([newer, older])
  expect(list[0].title).toHaveLength(60)
  expect(await getThread(pg, older)).toMatchObject({
    id: older,
    owner: A,
    title: "older"
  })
  expect(await getThread(pg, "44444444-4444-4444-8444-000000000000")).toBeNull()
})

test("claim: one run wins, a second is refused, release frees it", async () => {
  const t = await createThread(pg, A, "busy")
  expect(await claimRun(pg, t, "run-1")).toBe(true)
  expect(await claimRun(pg, t, "run-2")).toBe(false)

  await releaseRun(pg, t, "run-2") // not the holder: no effect
  expect(await claimRun(pg, t, "run-3")).toBe(false)

  await releaseRun(pg, t, "run-1")
  expect(await claimRun(pg, t, "run-3")).toBe(true)
})

test("claim: concurrent claims on one thread give exactly one winner", async () => {
  const t = await createThread(pg, A, "race")
  const wins = await Promise.all(
    ["r1", "r2", "r3", "r4"].map(r => claimRun(pg, t, r))
  )
  expect(wins.filter(Boolean)).toHaveLength(1)
})

test("claim: a claim older than 5 minutes is taken over; the old run can't release it", async () => {
  const t = await createThread(pg, A, "stale")
  expect(await claimRun(pg, t, "crashed")).toBe(true)
  await pg.query(
    `update chat_threads set run_started_at = now() - interval '6 minutes' where id = $1`,
    [t]
  )

  expect(await claimRun(pg, t, "fresh")).toBe(true)
  await releaseRun(pg, t, "crashed")
  expect(await claimRun(pg, t, "third")).toBe(false) // still held by "fresh"
})

test("cancel: only the running run sees the flag, and a new claim clears it", async () => {
  const t = await createThread(pg, A, "stop")
  await requestCancel(pg, t) // nothing running: ignored
  expect(await claimRun(pg, t, "run-1")).toBe(true)
  expect(await isCancelRequested(pg, t, "run-1")).toBe(false)

  await requestCancel(pg, t)
  expect(await isCancelRequested(pg, t, "run-1")).toBe(true)
  expect(await isCancelRequested(pg, t, "other-run")).toBe(false)

  await releaseRun(pg, t, "run-1")
  expect(await claimRun(pg, t, "run-2")).toBe(true)
  expect(await isCancelRequested(pg, t, "run-2")).toBe(false)
})
