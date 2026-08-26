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
  /** Pinned include_fields: the id plus every field golden rules resolve
   * against, so judgments can be checked against a live index. */
  includeFields: string
  categories: readonly string[]
}

export const evalCollections: Record<string, EvalCollection> = {
  bills: {
    alias: "bills",
    evalCollection: "bills_eval",
    searchParams: billsSearchParams,
    relevanceSort: billsRelevanceSort,
    includeFields: "id,court,number,title,primarySponsor,currentCommittee",
    categories: [
      "exact-bill-id",
      "topic",
      "synonym",
      "misspelling",
      "member-committee",
      "hyphenation"
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
    ]
  },
  publishedTestimony: {
    alias: "publishedTestimony",
    evalCollection: "publishedTestimony_eval",
    searchParams: testimonySearchParams,
    relevanceSort: testimonyRelevanceSort,
    includeFields: "id,court,billId,authorDisplayName,authorRole,position",
    categories: ["bill-id", "author", "topic", "synonym", "misspelling", "role"]
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
