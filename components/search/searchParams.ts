/** Ranking-relevant Typesense search parameters shared between the app's
 * search pages and the relevance eval harness (scripts/search-eval). Keep this
 * module free of React/Next imports so it can be loaded from ts-node scripts.
 */
import { SYNONYM_SET_NAME } from "functions/src/search/synonyms"
import type { TypesenseInstantsearchAdapterOptions } from "typesense-instantsearch-adapter"

export type SearchParameters = NonNullable<
  TypesenseInstantsearchAdapterOptions["additionalSearchParameters"]
>

/** Derives query_by + query_by_weights from one ordered field-to-weight map,
 * so the two parallel comma-separated lists can't drift out of sync.
 */
const weighted = (fields: Record<string, number>) => ({
  query_by: Object.keys(fields).join(","),
  query_by_weights: Object.values(fields).join(",")
})

/** Server-level synonym set (Typesense >= 30) applied at query time; every
 * collection that searches legislative prose wants it. Deploys keep the set
 * itself current — see functions/src/search/synonyms.ts.
 */
const legislativeSynonyms = SYNONYM_SET_NAME

export const billsSearchParams = {
  ...weighted({
    number: 10,
    numberVariants: 10,
    title: 5,
    /** Between title and body: denser and more topical than the statutory
     * text in `body`, but not the bill's own name. Weights 2, 3 and 4 return
     * byte-identical results on the golden set (1 is a hair worse at 0.754);
     * at 5 or above, where pinslip meets or beats `title`, bills nDCG@10
     * drops 0.755 -> 0.744. The useful constraint is the ceiling, not the
     * exact value: keep it strictly below `title`.
     */
    pinslip: 3,
    /** The LLM plain-language description (functions/src/bills/search.ts).
     * Below pinslip because the clerk's blurb states the bill's purpose in the
     * legislature's own words, while this restates it; both sit under `title`.
     *
     * Weights 1 through 4 are a plateau at nDCG@10 0.739 (2 has the best
     * recall@10 at 0.880); at 5, where summary meets `title`, it collapses to
     * 0.693 and topic falls 0.500 -> 0.394. As with pinslip, the useful
     * constraint is the ceiling, not the exact value.
     */
    summary: 2,
    primarySponsor: 4,
    cosponsors: 3,
    currentCommittee: 4,
    body: 1
  }),
  synonym_sets: legislativeSynonyms,
  /** The adapter defaults highlight_full_fields to query_by, which returns
   * every searched field a second time in full with <mark> tags. BillHit
   * renders exactly one <Highlight>, on title, and reads pinslip only through
   * <Snippet> — so title is the only field that needs the full copy. Naming it
   * here drops roughly 2.4KB per page of pinslip nobody reads. Add a field to
   * this list before rendering a <Highlight> for it, or it will render
   * unmarked.
   */
  highlight_full_fields: "title",
  /** numberVariants holds the space-separated form of each bill number (see
   * functions/src/bills/search.ts). It is a matching artifact, so excluding it
   * keeps it out of hits and out of the adapter's highlight output, which
   * defaults to query_by. pinslip and summary are deliberately NOT excluded:
   * the adapter builds _snippetResult by walking the returned document
   * (SearchResponseAdapter._adaptHighlightInObjectValue), so excluding either
   * would leave its <Snippet> with nothing to render. summary costs roughly
   * 10.8KB per 20-hit page; `highlight_full_fields` above is what keeps that
   * from doubling.
   */
  exclude_fields: "body,numberVariants"
} satisfies SearchParameters

/** The app's "Relevance" sort option (see useBillSort.tsx). The eval harness
 * must use this sort; the UI's default latestTestimonyAt:desc sort does not
 * measure text relevance.
 *
 * The `_eval` clause sorts every Order and Extension Order below every other
 * document. They are procedural — "Extension Order - Education", "Order
 * relative to authorizing the joint committee on Education to make an
 * investigation and study" — and they match a committee query in title,
 * pinslip and body without being what anyone searching a committee wants.
 * Demoting rather than dropping them scores better than removing them from the
 * index outright (0.752 against 0.749, member-committee 0.934 against 0.920)
 * and keeps them findable: no bill shares their number, so "H4394" still
 * returns the order at rank 1.
 *
 * Only Order and Extension Order. Widening it to everything that is not a Bill
 * scores higher overall (0.756) but demotes Resolves and constitutional
 * amendment proposals, which are legislation people search for, and it
 * regresses hyp-006.
 *
 * What it does cost is searching for the type by name: "Extension Order
 * Education" puts bills first and the real orders at rank 26 of 32. The
 * legislationType refinement (useBillRefinements.tsx) is how a searcher who
 * wants them gets them back, which is why the facet ships with this sort.
 *
 * Written as two `!=` clauses rather than the equivalent `!=[...]` list form:
 * this string doubles as the InstantSearch index name, which travels through
 * the URL as a qs key, and qs parses percent-encoded square brackets in a key
 * as nesting — mangling the routed uiState so a reload or shared link loses
 * the query, refinements and sort. No other character here is special to qs.
 */
export const billsRelevanceSort =
  "_eval(legislationType:!=`Order` && legislationType:!=`Extension Order`):desc,_text_match:desc,testimonyCount:desc"

export const testimonySearchParams = {
  ...weighted({
    billId: 10,
    billIdVariants: 10,
    authorDisplayName: 6,
    content: 3,
    authorRole: 1
  }),
  synonym_sets: legislativeSynonyms,
  /** A matching artifact, like bills' numberVariants: excluding it keeps it out
   * of hits and out of the adapter's highlight output, which defaults to
   * query_by. */
  exclude_fields: "billIdVariants"
} satisfies SearchParameters

/** The app's "Relevance" sort option (see useTestimonySort in
 * testimony/TestimonySearch.tsx), and the sort the eval harness must use.
 */
export const testimonyRelevanceSort = "_text_match:desc,publishedAt:desc"

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
  synonym_sets: legislativeSynonyms
} satisfies SearchParameters

/** The app's "Relevance" sort option (see useHearingSort in
 * hearings/HearingSearch.tsx). Every other hearings sort is date-ordered, so
 * this is the only one under which text ranking is observable — and the only
 * one the eval harness can score.
 *
 * No sort_by is pinned in hearingsSearchParams above: the adapter derives it
 * from the "hearings/sort/<sort_by>" index name of the selected option, which
 * takes precedence over additionalSearchParameters.
 */
export const hearingsRelevanceSort = "_text_match:desc,startsAt:desc"
