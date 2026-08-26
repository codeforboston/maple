import { isString } from "lodash"
import { db } from "../firebase"
import { createSearchIndexer } from "../search"
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
  schema: {
    fields: [
      { name: "number", type: "string", facet: false },
      { name: "court", type: "int32", facet: true },
      { name: "title", type: "string", facet: false },
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
      title: bill.content.Title,
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
