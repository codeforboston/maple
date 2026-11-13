import type { Queryable } from "./db"

export type ThreadSummary = { id: string; title: string; updatedAt: string }

/** A claim older than this is treated as a crashed run and can be taken over. */
export const STALE_CLAIM_MINUTES = 5

const summary = (r: {
  id: string
  title: string
  updated_at: Date | string
}): ThreadSummary => ({
  id: r.id,
  title: r.title,
  updatedAt: new Date(r.updated_at).toISOString()
})

export async function createThread(
  db: Queryable,
  owner: string,
  title: string
): Promise<string> {
  const { rows } = await db.query(
    `insert into chat_threads (owner, title) values ($1, $2) returning id`,
    [owner, title.slice(0, 60)]
  )
  return rows[0].id
}

export async function listThreads(
  db: Queryable,
  owner: string,
  limit = 50
): Promise<ThreadSummary[]> {
  const { rows } = await db.query(
    `select id, title, updated_at from chat_threads where owner = $1
      order by updated_at desc limit $2`,
    [owner, limit]
  )
  return rows.map(summary)
}

export async function getThread(
  db: Queryable,
  id: string
): Promise<(ThreadSummary & { owner: string }) | null> {
  const { rows } = await db.query(
    `select id, owner, title, updated_at from chat_threads where id = $1::uuid`,
    [id]
  )
  return rows[0] ? { ...summary(rows[0]), owner: rows[0].owner } : null
}

/** Atomic: true only for the one run that gets the thread (across instances). */
export async function claimRun(
  db: Queryable,
  threadId: string,
  runId: string
): Promise<boolean> {
  const { rows } = await db.query(
    `update chat_threads
        set running_run_id = $2, run_started_at = now(), cancel_requested = false, updated_at = now()
      where id = $1::uuid
        and (running_run_id is null or run_started_at < now() - make_interval(mins => $3))
      returning id`,
    [threadId, runId, STALE_CLAIM_MINUTES]
  )
  return rows.length === 1
}

/** Frees the thread only if this run still holds it (a stale takeover must not be undone). */
export async function releaseRun(
  db: Queryable,
  threadId: string,
  runId: string
) {
  await db.query(
    `update chat_threads set running_run_id = null, run_started_at = null, updated_at = now()
      where id = $1::uuid and running_run_id = $2`,
    [threadId, runId]
  )
}

/** Polls until the thread has no running run, for at most `ms`; true once it is free. */
export async function waitUntilIdle(
  db: Queryable,
  threadId: string,
  ms: number
): Promise<boolean> {
  for (const end = Date.now() + ms; ; ) {
    const { rows } = await db.query(
      `select running_run_id is null as idle from chat_threads where id = $1::uuid`,
      [threadId]
    )
    if (rows[0]?.idle !== false) return true
    if (Date.now() >= end) return false
    await new Promise(r => setTimeout(r, 100))
  }
}

export async function requestCancel(db: Queryable, threadId: string) {
  await db.query(
    `update chat_threads set cancel_requested = true where id = $1::uuid and running_run_id is not null`,
    [threadId]
  )
}

export async function isCancelRequested(
  db: Queryable,
  threadId: string,
  runId: string
): Promise<boolean> {
  const { rows } = await db.query(
    `select cancel_requested from chat_threads where id = $1::uuid and running_run_id = $2`,
    [threadId, runId]
  )
  return rows[0]?.cancel_requested === true
}
