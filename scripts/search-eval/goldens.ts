import { readFileSync } from "fs"
import { join } from "path"
import {
  Array as A,
  Boolean as B,
  Literal as L,
  Number as N,
  Optional,
  Record as R,
  Static,
  String as S,
  Union
} from "runtypes"
import { CorpusDoc } from "./corpus"
import { Judgments } from "./metrics"

export const goldensPath = join(
  __dirname,
  "../../tests/search-eval/goldens/bills.json"
)

const Rule = R({
  field: Optional(S),
  anyField: Optional(A(S)),
  equals: Optional(S),
  contains: Optional(S)
})

const RelevantEntry = R({
  docId: Optional(S),
  rule: Optional(Rule),
  grade: N
})

export const Category = Union(
  L("exact-bill-id"),
  L("topic"),
  L("synonym"),
  L("misspelling"),
  L("member-committee")
)

const GoldenQuery = R({
  id: S,
  category: Category,
  query: S,
  relevant: Optional(A(RelevantEntry)),
  sameAs: Optional(S),
  courtFilter: Optional(B)
})

const GoldenSet = R({
  collection: S,
  defaults: R({ sort_by: S, courtFilter: B }),
  queries: A(GoldenQuery)
})

export type GoldenQuery = Static<typeof GoldenQuery>
export type GoldenSet = Static<typeof GoldenSet>
export type Rule = Static<typeof Rule>

export function loadGoldens(): GoldenSet {
  const goldens = GoldenSet.check(JSON.parse(readFileSync(goldensPath, "utf8")))
  const ids = new Set(goldens.queries.map(q => q.id))
  if (ids.size !== goldens.queries.length)
    throw Error("Duplicate query ids in golden set")
  for (const q of goldens.queries) {
    if (!q.relevant && !q.sameAs)
      throw Error(`Query ${q.id} has neither relevant labels nor sameAs`)
    if (q.sameAs && !ids.has(q.sameAs))
      throw Error(`Query ${q.id} sameAs references unknown id ${q.sameAs}`)
  }
  return goldens
}

/** Normalization applied to rule values and doc fields (NOT to the query text
 * sent to Typesense — tokenizer behavior on raw input is part of what's
 * measured): uppercase, drop everything but letters and digits.
 */
export const normalize = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "")

function ruleFields(rule: Rule): string[] {
  const fields = rule.anyField ?? (rule.field ? [rule.field] : [])
  if (!fields.length) throw Error("Rule specifies no field")
  return fields
}

function ruleMatches(rule: Rule, doc: CorpusDoc): boolean {
  const values = ruleFields(rule)
    .flatMap(field => {
      const value = (doc as Record<string, unknown>)[field]
      return Array.isArray(value) ? value : [value]
    })
    .filter((v): v is string => typeof v === "string")
    .map(normalize)

  if (rule.equals !== undefined) {
    const expected = normalize(rule.equals)
    return values.some(v => v === expected)
  }
  if (rule.contains !== undefined) {
    const expected = normalize(rule.contains)
    return values.some(v => v.includes(expected))
  }
  throw Error("Rule specifies neither equals nor contains")
}

export const labels = (query: GoldenQuery, goldens: GoldenSet) => {
  const source = query.sameAs
    ? goldens.queries.find(q => q.id === query.sameAs)!
    : query
  if (!source.relevant) throw Error(`Query ${source.id} has no relevant labels`)
  return source.relevant
}

/** Resolves a query's judgments against the corpus. Docs outside `court` are
 * excluded when the query uses the court filter, matching what the search
 * itself can return.
 */
export function resolveJudgments(
  query: GoldenQuery,
  goldens: GoldenSet,
  docs: CorpusDoc[],
  court: number | undefined
): Judgments {
  const judgments: Judgments = new Map()
  const inScope =
    court === undefined ? docs : docs.filter(d => d.court === court)

  for (const entry of labels(query, goldens)) {
    if (entry.docId) {
      judgments.set(entry.docId, entry.grade)
    } else if (entry.rule) {
      for (const doc of inScope.filter(d => ruleMatches(entry.rule!, d))) {
        judgments.set(doc.id, Math.max(judgments.get(doc.id) ?? 0, entry.grade))
      }
    } else {
      throw Error(`Query ${query.id} has a label with neither docId nor rule`)
    }
  }
  return judgments
}

/** Rule resolution for live (dev/prod) targets where the local corpus is not
 * authoritative: search the rule's fields for the rule value and keep the
 * results the rule actually matches.
 */
export async function resolveRuleViaSearch(
  rule: Rule,
  grade: number,
  search: (params: {
    q: string
    query_by: string
    per_page: number
  }) => Promise<CorpusDoc[]>
): Promise<Judgments> {
  const value = rule.equals ?? rule.contains
  if (value === undefined)
    throw Error("Rule specifies neither equals nor contains")
  const found = await search({
    q: value,
    query_by: ruleFields(rule).join(","),
    per_page: 250
  })
  return new Map(
    found.filter(doc => ruleMatches(rule, doc)).map(doc => [doc.id, grade])
  )
}
