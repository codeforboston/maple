import { isString } from "lodash"
import { db } from "../firebase"
import { createSearchIndexer } from "../search"
import { billNumberVariants, billNumberVariantsVersion } from "./numberVariants"
import { Bill, BillTopic } from "./types"

export const {
  syncToSearchIndex: syncBillToSearchIndex,
  upgradeSearchIndex: upgradeBillSearchIndex,
  runBackfillChunk: runBillBackfillChunk
} = createSearchIndexer({
  sourceCollection: db.collectionGroup("bills"),
  documentTrigger: `generalCourts/{court}/bills/{id}`,
  alias: "bills",
  idField: "id",
  convertVersion: billNumberVariantsVersion,
  schema: {
    /** Hyphens do not split tokens by default, so "vote-by-mail" indexes as one
     * token and the spaced form people type cannot reach it — the two spellings
     * return disjoint result sets. Splitting on "-" makes each form find both,
     * and makes the parts individually searchable ("income" reaches
     * "low-income"). Hyphenated compounds are everywhere in this corpus:
     * low-income, long-term, well-being, community-based, in-person.
     */
    token_separators: ["-"],
    fields: [
      { name: "number", type: "string", facet: false },
      { name: "numberVariants", type: "string[]", facet: false },
      { name: "court", type: "int32", facet: true },
      { name: "title", type: "string", facet: false },
      { name: "pinslip", type: "string", facet: false, optional: true },
      { name: "summary", type: "string", facet: false, optional: true },
      { name: "legislationType", type: "string", facet: true, optional: true },
      { name: "body", type: "string", facet: false, optional: true },
      { name: "city", type: "string", facet: true, optional: true },
      { name: "currentCommittee", type: "string", facet: true, optional: true },
      { name: "testimonyCount", type: "int32" },
      { name: "primarySponsor", type: "string", facet: true, optional: true },
      {
        name: "cosponsors",
        type: "string[]",
        facet: true
      },
      { name: "cosponsorCount", type: "int32" },
      { name: "nextHearingAt", type: "int64", optional: true },
      { name: "latestTestimonyAt", type: "int64", optional: true },

      { name: "endorseCount", type: "int32" },
      { name: "opposeCount", type: "int32" },
      { name: "neutralCount", type: "int32" },

      { name: "topics.lvl0", type: "string[]", facet: true, optional: true },
      { name: "topics.lvl1", type: "string[]", facet: true, optional: true }
    ],
    default_sorting_field: "testimonyCount"
  },
  convert: data => {
    const validation = Bill.validateWithDefaults(data)
    if (!validation.success) {
      console.error(data, validation.message, validation.details)
    }
    const bill = Bill.checkWithDefaults(data)

    const { categories, topics } = buildTopicsForSearch(bill.topics)

    return {
      id: `${bill.court}-${bill.id}`,
      court: bill.court,
      number: bill.id,
      numberVariants: billNumberVariants(bill.id),
      title: bill.content.Title,
      /** Nullable in Firestore, but an optional Typesense field rejects an
       * explicit null, so the absent case has to be undefined.
       *
       * The cap drops the ~20 procedural study orders whose Pinslip is a
       * concatenated committee docket rather than a description; indexed whole
       * they match nearly any topical query. Numbers and the top-10 evidence:
       * "Long fields are topic-agnostic magnets" in
       * tests/search-eval/README.md.
       *
       * Inline rather than a named constant — SearchIndexer hashes
       * `convert.toString()`, the same trap documented on buildTopicsForSearch
       * below.
       */
      pinslip:
        bill.content.Pinslip && bill.content.Pinslip.length <= 2000
          ? bill.content.Pinslip
          : undefined,
      /** The LLM plain-language description of what the bill does, written by
       * the `bill_on_document_created` trigger in llm/. Deliberately uncapped,
       * unlike `pinslip` above: across prod's court 192 these run 166 to 922
       * characters (median 538), so there is no long-field tail to guard
       * against. Do not add a cap here by analogy.
       *
       * Orders are withheld for the same reason the pinslip cap exists, and
       * against the same documents. A procedural order ("Extension Order -
       * Education", "Order relative to authorizing the joint committee on
       * Education to make an investigation and study") matches a committee
       * query in title, pinslip and body already; a summary hands it a fourth
       * field, and `fields_matched` sits in the lowest bits of `_text_match`,
       * so it outranks the bills actually before that committee. Measured on
       * "Education Committee": nDCG@10 0.558 -> 0.064 with order summaries
       * indexed, and back to 0.558 with them withheld — the whole
       * member-committee cost of this field, and nothing else.
       *
       * Only Order and Extension Order. Resolves and constitutional amendment
       * proposals are legislation people search for; "Bill or nothing" would
       * be the wrong cut.
       *
       * Inline rather than a named constant — SearchIndexer hashes
       * `convert.toString()`, as on `pinslip` above.
       */
      summary:
        bill.content.LegislationTypeName === "Order" ||
        bill.content.LegislationTypeName === "Extension Order"
          ? undefined
          : bill.summary,
      /** Faceted so procedural documents can be told apart from legislation at
       * query time rather than dropped at index time — see #95. */
      legislationType: bill.content.LegislationTypeName ?? undefined,
      body: bill.content.DocumentText,
      city: bill.city,
      currentCommittee: bill.currentCommittee?.name,
      testimonyCount: bill.testimonyCount,
      primarySponsor: bill.content.PrimarySponsor?.Name,
      cosponsors: bill.content.Cosponsors.map(m => m.Name).filter(isString),
      cosponsorCount: bill.content.Cosponsors.length,
      nextHearingAt: bill.nextHearingAt?.toMillis(),
      latestTestimonyAt: bill.latestTestimonyAt?.toMillis(),
      endorseCount: bill.endorseCount,
      opposeCount: bill.opposeCount,
      neutralCount: bill.neutralCount,
      "topics.lvl0": categories,
      "topics.lvl1": topics
    }
  }
})

/** Called from `convert`, so the collection-name hash does not see this
 * function's body (it hashes `convert.toString()` only). Rewriting it changes
 * what gets indexed without scheduling a reindex — which is what happened in
 * ce137bdc, leaving the live topic facets in the pre-Nov-2024 format until an
 * unrelated schema change finally forced a rebuild. Set `convertVersion` on the
 * config below when you edit this, or inline it into `convert`.
 */
const buildTopicsForSearch = (billTopics: BillTopic[] = []) => {
  const categoriesSorted = billTopics.map(t => t.category).sort()

  // Instantsearch needs lower hierarchical levels in the form "category > topic"
  const topicsSorted = billTopics.map(t => `${t.category} > ${t.topic}`).sort()
  return { categories: categoriesSorted, topics: topicsSorted }
}
