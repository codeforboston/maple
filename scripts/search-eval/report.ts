import { readFileSync, writeFileSync } from "fs"
import { QueryMetrics, averageMetrics } from "./metrics"

export type QueryResult = {
  id: string
  category: string
  query: string
  metrics: QueryMetrics
  top10: string[]
  relevantCount: number
}

export type EvalResults = {
  meta: {
    env: string
    url: string
    collection: string
    serverVersion: string
    corpusMd5: string
    gitSha: string
    timestamp: string
    sortBy: string
    court: number | undefined
    skippedQueries: string[]
  }
  overall: QueryMetrics & { queryCount: number }
  categories: Record<string, QueryMetrics & { queryCount: number }>
  queries: QueryResult[]
}

export function buildResults(
  meta: EvalResults["meta"],
  queries: QueryResult[]
): EvalResults {
  const categories: EvalResults["categories"] = {}
  const categoryNames = Array.from(new Set(queries.map(q => q.category))).sort()
  for (const category of categoryNames) {
    categories[category] = averageMetrics(
      queries.filter(q => q.category === category).map(q => q.metrics)
    )
  }
  return {
    meta,
    overall: averageMetrics(queries.map(q => q.metrics)),
    categories,
    queries
  }
}

const row = (label: string, m: QueryMetrics & { queryCount: number }) => ({
  category: label,
  queries: m.queryCount,
  "recall@10": m.recallAt10.toFixed(3),
  MRR: m.mrr.toFixed(3),
  "nDCG@10": m.ndcgAt10.toFixed(3)
})

export function printScorecard(results: EvalResults) {
  console.log(
    `\nSearch relevance scorecard — server ${results.meta.serverVersion}, ` +
      `collection ${results.meta.collection}, sort "${results.meta.sortBy}"` +
      (results.meta.court !== undefined ? `, court ${results.meta.court}` : "")
  )
  console.table([
    ...Object.entries(results.categories).map(([category, m]) =>
      row(category, m)
    ),
    row("OVERALL", results.overall)
  ])
  if (results.meta.skippedQueries.length)
    console.log(
      `Skipped ${results.meta.skippedQueries.length} queries: ` +
        results.meta.skippedQueries.join(", ")
    )
}

export function writeResults(results: EvalResults, path: string) {
  writeFileSync(path, JSON.stringify(results, null, 2) + "\n")
  console.log(`Wrote results to ${path}`)
}

export function compare(
  baselinePath: string,
  candidatePath: string,
  threshold: number
): boolean {
  const baseline: EvalResults = JSON.parse(readFileSync(baselinePath, "utf8"))
  const candidate: EvalResults = JSON.parse(readFileSync(candidatePath, "utf8"))

  console.log(
    `\nComparing ${candidatePath} (server ${candidate.meta.serverVersion})` +
      ` against ${baselinePath} (server ${baseline.meta.serverVersion})`
  )
  if (baseline.meta.corpusMd5 !== candidate.meta.corpusMd5)
    console.warn("WARNING: corpus hashes differ — not an apples-to-apples run")

  const delta = (b: QueryMetrics, c: QueryMetrics) => ({
    "Δrecall@10": (c.recallAt10 - b.recallAt10).toFixed(3),
    ΔMRR: (c.mrr - b.mrr).toFixed(3),
    "ΔnDCG@10": (c.ndcgAt10 - b.ndcgAt10).toFixed(3)
  })

  const categories = Array.from(
    new Set([
      ...Object.keys(baseline.categories),
      ...Object.keys(candidate.categories)
    ])
  ).sort()
  console.table([
    ...categories
      .filter(c => baseline.categories[c] && candidate.categories[c])
      .map(c => ({
        category: c,
        ...delta(baseline.categories[c], candidate.categories[c])
      })),
    { category: "OVERALL", ...delta(baseline.overall, candidate.overall) }
  ])

  const baselineQueries = new Map(baseline.queries.map(q => [q.id, q]))
  const regressions = candidate.queries.filter(q => {
    const before = baselineQueries.get(q.id)
    return before && before.metrics.ndcgAt10 - q.metrics.ndcgAt10 > threshold
  })
  if (regressions.length) {
    console.log(`\nPer-query nDCG@10 regressions > ${threshold}:`)
    console.table(
      regressions.map(q => ({
        id: q.id,
        query: q.query,
        before: baselineQueries.get(q.id)!.metrics.ndcgAt10.toFixed(3),
        after: q.metrics.ndcgAt10.toFixed(3)
      }))
    )
  }

  const overallRegressed =
    baseline.overall.ndcgAt10 - candidate.overall.ndcgAt10 > threshold
  if (overallRegressed)
    console.error(`Overall nDCG@10 regressed by more than ${threshold}`)
  return !overallRegressed
}
