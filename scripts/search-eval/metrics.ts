/** Relevance judgments for one query: docId -> grade (grade > 0 = relevant). */
export type Judgments = Map<string, number>

export type QueryMetrics = {
  recallAt10: number
  mrr: number
  ndcgAt10: number
}

const K = 10

/** Capped recall@10: relevant results in the top 10 over min(|relevant|, 10),
 * so a query with more than 10 relevant docs can still score 1.0.
 */
export function recallAtK(resultIds: string[], judgments: Judgments): number {
  const denominator = Math.min(judgments.size, K)
  if (denominator === 0) return 0
  const hits = resultIds
    .slice(0, K)
    .filter(id => (judgments.get(id) ?? 0) > 0).length
  return hits / denominator
}

/** Reciprocal rank of the first relevant result, 0 if none appear. */
export function mrr(resultIds: string[], judgments: Judgments): number {
  const rank = resultIds.findIndex(id => (judgments.get(id) ?? 0) > 0)
  return rank === -1 ? 0 : 1 / (rank + 1)
}

/** nDCG@10 with exponential gain (2^grade - 1). */
export function ndcgAtK(resultIds: string[], judgments: Judgments): number {
  const gain = (grade: number) => Math.pow(2, grade) - 1
  const discount = (rank: number) => 1 / Math.log2(rank + 2)

  const dcg = resultIds
    .slice(0, K)
    .reduce((sum, id, i) => sum + gain(judgments.get(id) ?? 0) * discount(i), 0)

  const idealDcg = Array.from(judgments.values())
    .sort((a, b) => b - a)
    .slice(0, K)
    .reduce((sum, grade, i) => sum + gain(grade) * discount(i), 0)

  return idealDcg === 0 ? 0 : dcg / idealDcg
}

export function computeMetrics(
  resultIds: string[],
  judgments: Judgments
): QueryMetrics {
  return {
    recallAt10: recallAtK(resultIds, judgments),
    mrr: mrr(resultIds, judgments),
    ndcgAt10: ndcgAtK(resultIds, judgments)
  }
}

export function averageMetrics(all: QueryMetrics[]): QueryMetrics & {
  queryCount: number
} {
  const avg = (select: (m: QueryMetrics) => number) =>
    all.length ? all.reduce((sum, m) => sum + select(m), 0) / all.length : 0
  return {
    recallAt10: avg(m => m.recallAt10),
    mrr: avg(m => m.mrr),
    ndcgAt10: avg(m => m.ndcgAt10),
    queryCount: all.length
  }
}
