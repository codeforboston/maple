/** Per-collection eval configuration. The search parameters come straight from
 * the app (components/search/searchParams.ts) so ranking changes there flow
 * into the eval without edits here.
 */
import type { TypesenseInstantsearchAdapterOptions } from "typesense-instantsearch-adapter"
import {
  billsRelevanceSort,
  billsSearchParams,
  hearingsRelevanceSort,
  hearingsSearchParams,
  testimonyRelevanceSort,
  testimonySearchParams
} from "../../components/search/searchParams"

type SearchParameters = NonNullable<
  TypesenseInstantsearchAdapterOptions["additionalSearchParameters"]
>

export type EvalCollection = {
  /** CollectionConfig.alias — also the corpus directory and golden set name. */
  alias: string
  /** Local collection the corpus is seeded into, kept distinct from the
   * dev-workflow alias so `yarn dev:up` data is never touched. */
  evalCollection: string
  searchParams: SearchParameters
  /** The app's relevance sort option. A golden set's defaults.sort_by must
   * match it, or the eval is measuring an ordering no user can select. */
  relevanceSort: string
  /** Pinned include_fields: the id, every field golden rules resolve against
   * so judgments can be checked against a live index, and any field a human
   * needs in the labeling sheet to judge relevance — its columns come from
   * this list. bills' `pinslip` and `summary` are there for the second reason
   * only; no rule names either, deliberately (see the README on why widening
   * rules to the field under test rewards it by construction). */
  includeFields: string
  categories: readonly string[]
  /** How to rebuild this corpus, in order. Printed when the committed md5 does
   * not match — which is exactly when a contributor is looking for the recipe,
   * so it has to be the recipe the README documents and not an approximation of
   * it. bills is two steps because its documents come from the emulator fixture
   * while `summary` is joined in from a live project.
   */
  regenerate: readonly string[]
}

export const evalCollections: Record<string, EvalCollection> = {
  bills: {
    alias: "bills",
    evalCollection: "bills_eval",
    searchParams: billsSearchParams,
    relevanceSort: billsRelevanceSort,
    includeFields:
      "id,court,number,title,pinslip,summary,primarySponsor,currentCommittee",
    categories: [
      "exact-bill-id",
      "topic",
      "synonym",
      "misspelling",
      "member-committee",
      "hyphenation",
      "plain-language"
    ],
    regenerate: [
      "yarn search-eval:corpus",
      "yarn search-eval enrich --env prod --alias bills --field summary"
    ]
  },
  hearings: {
    alias: "hearings",
    evalCollection: "hearings_eval",
    searchParams: hearingsSearchParams,
    relevanceSort: hearingsRelevanceSort,
    includeFields:
      "id,court,title,committeeName,chairNames,billNumbers,agendaTopics,locationName,locationCity",
    categories: [
      "committee",
      "chair",
      "bill-on-agenda",
      "agenda-topic",
      "location",
      "synonym",
      "misspelling"
    ],
    regenerate: ["yarn search-eval corpus --env prod --alias hearings"]
  },
  publishedTestimony: {
    alias: "publishedTestimony",
    evalCollection: "publishedTestimony_eval",
    searchParams: testimonySearchParams,
    relevanceSort: testimonyRelevanceSort,
    includeFields: "id,court,billId,authorDisplayName,authorRole,position",
    categories: [
      "bill-id",
      "author",
      "topic",
      "synonym",
      "misspelling",
      "role"
    ],
    regenerate: [
      "yarn search-eval corpus --env prod --alias publishedTestimony --order-by publishedAt:desc"
    ]
  }
}

export const aliases = Object.keys(evalCollections)

export function resolveEvalCollection(alias: string): EvalCollection {
  const collection = evalCollections[alias]
  if (!collection)
    throw Error(
      `Unknown eval collection "${alias}". Known: ${aliases.join(", ")}`
    )
  return collection
}
