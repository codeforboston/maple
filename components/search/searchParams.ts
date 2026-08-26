/** Ranking-relevant Typesense search parameters shared between the app's
 * search pages and the relevance eval harness (scripts/search-eval). Keep this
 * module free of React/Next imports so it can be loaded from ts-node scripts.
 */
import type { TypesenseInstantsearchAdapterOptions } from "typesense-instantsearch-adapter"

type SearchParameters = NonNullable<
  TypesenseInstantsearchAdapterOptions["additionalSearchParameters"]
>

/** Derives query_by + query_by_weights from one ordered field-to-weight map,
 * so the two parallel comma-separated lists can't drift out of sync.
 */
const weighted = (fields: Record<string, number>) => ({
  query_by: Object.keys(fields).join(","),
  query_by_weights: Object.values(fields).join(",")
})

export const billsSearchParams = {
  ...weighted({
    number: 10,
    title: 5,
    primarySponsor: 4,
    cosponsors: 3,
    currentCommittee: 4,
    body: 1
  }),
  exclude_fields: "body"
} satisfies SearchParameters

/** The app's "Relevance" sort option (see useBillSort.tsx). The eval harness
 * must use this sort; the UI's default latestTestimonyAt:desc sort does not
 * measure text relevance.
 */
export const billsRelevanceSort = "_text_match:desc,testimonyCount:desc"

export const testimonySearchParams = {
  ...weighted({ billId: 10, authorDisplayName: 6, content: 3, authorRole: 1 }),
  exclude_fields: ""
} satisfies SearchParameters

/** Hearings always sort by startsAt (no _text_match sort option), so these
 * weights govern which documents match and typo/tie behavior, not ordering.
 */
export const hearingsSearchParams = {
  ...weighted({
    billNumbers: 10,
    title: 8,
    chairNames: 6,
    agendaTopics: 5,
    description: 2,
    locationName: 2,
    locationCity: 2
  }),
  sort_by: "startsAt:asc"
} satisfies SearchParameters
