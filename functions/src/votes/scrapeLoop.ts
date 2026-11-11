// Loop logic shared by the roll call scrapers and the backfill script.
// Kept free of Firestore so it can be unit tested.

export type AddResult =
  | { status: "added" }
  // The roll call does not exist (404 / not in the API).
  | { status: "missing" }
  // This roll call could not be processed; later ones may still work.
  | { status: "failed"; reason: string }
  // Nothing can be processed this run (e.g. the member list failed to load).
  | { status: "fatal"; reason: string }

export type ScrapeSummary = {
  added: number[]
  missing: number[]
  failed: [number, string][]
  fatal?: string
}

export type AddRollCall = (rollCallNumber: number) => Promise<AddResult>

function emptySummary(): ScrapeSummary {
  return { added: [], missing: [], failed: [] }
}

async function attempt(add: AddRollCall, n: number): Promise<AddResult> {
  try {
    return await add(n)
  } catch (e) {
    return { status: "failed", reason: `${e}` }
  }
}

function record(summary: ScrapeSummary, n: number, result: AddResult) {
  switch (result.status) {
    case "added":
      summary.added.push(n)
      break
    case "missing":
      summary.missing.push(n)
      break
    case "failed":
      summary.failed.push([n, result.reason])
      break
    case "fatal":
      summary.fatal = result.reason
      break
  }
}

/**
 * Processes each of `numbers` in order. A missing or failed roll call does
 * not stop the loop; a fatal result does.
 */
export async function scrapeList(
  numbers: Iterable<number>,
  add: AddRollCall
): Promise<ScrapeSummary> {
  const summary = emptySummary()
  for (const n of numbers) {
    const result = await attempt(add, n)
    record(summary, n, result)
    if (result.status === "fatal") break
  }
  return summary
}

/**
 * For sources with no list of roll calls (House PDFs): walks upward from
 * `start`, skipping numbers in `stored`, and stops after `maxConsecutiveMissing`
 * missing roll calls in a row. Failed roll calls are recorded and skipped.
 */
export async function scrapeSequential(
  start: number,
  stored: ReadonlySet<number>,
  add: AddRollCall,
  maxConsecutiveMissing = 5,
  // Upper bound so a misbehaving source can never loop forever.
  maxNumber = start + 10_000
): Promise<ScrapeSummary> {
  const summary = emptySummary()
  let consecutiveMissing = 0
  for (let n = start; n <= maxNumber; n++) {
    if (stored.has(n)) {
      consecutiveMissing = 0
      continue
    }
    const result = await attempt(add, n)
    record(summary, n, result)
    if (result.status === "fatal") break
    if (result.status === "missing") {
      consecutiveMissing += 1
      if (consecutiveMissing >= maxConsecutiveMissing) break
    } else {
      consecutiveMissing = 0
    }
  }
  return summary
}

/** Missing numbers past the last roll call are expected; only report gaps. */
export function describeSummary(label: string, summary: ScrapeSummary) {
  const lastFound = Math.max(-1, ...summary.added)
  const gaps = summary.missing.filter(n => n < lastFound)
  return (
    `${label}: added ${summary.added.length}` +
    (summary.added.length
      ? ` (#${Math.min(...summary.added)}-#${lastFound})`
      : "") +
    (gaps.length ? `, missing ${gaps.join(", ")}` : "") +
    (summary.failed.length
      ? `, failed ${summary.failed.map(([n, r]) => `#${n} (${r})`).join("; ")}`
      : "") +
    (summary.fatal ? `, stopped: ${summary.fatal}` : "")
  )
}
