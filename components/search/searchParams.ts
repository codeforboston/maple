/** Ranking-relevant Typesense search parameters shared between the app's
 * search pages and the relevance eval harness (scripts/search-eval). Keep this
 * module free of React/Next imports so it can be loaded from ts-node scripts.
 */
export const billsSearchParams = {
  query_by: "number,title,body",
  exclude_fields: "body"
}

/** The app's "Relevance" sort option (see useBillSort.tsx). The eval harness
 * must use this sort; the UI's default latestTestimonyAt:desc sort does not
 * measure text relevance.
 */
export const billsRelevanceSort = "_text_match:desc,testimonyCount:desc"
