import { isString } from "lodash"
import { db } from "../firebase"
import { createSearchIndexer } from "../search"
import { Bill, CATEGORIES_BY_TOPIC } from "./types"

export const {
  syncToSearchIndex: syncBillToSearchIndex,
  upgradeSearchIndex: upgradeBillSearchIndex
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

const buildTopicsForSearch = (billTopics: string[] = []) => {
  // We need to enrich the topics with the associated topic categories for the hierachical facets
  const topicsByCategory = billTopics.reduce((acc, topic) => {
    const category = CATEGORIES_BY_TOPIC[topic]
    if (!category) {
      console.error(`No category found for topic ${topic}`)
      return acc
    }
    if (!acc[category]) acc[category] = []
    acc[category].push(topic)
    return acc
  }, {} as { [key: string]: string[] })

  const categories = Object.keys(topicsByCategory).sort()
  const topicsSorted = Object.entries(topicsByCategory)
    .reduce((acc, [category, topics]) => {
      // Instantsearch needs lower hierarchical levels in the form "category > topic"
      acc.push(...topics.map(topic => `${category} > ${topic}`))
      return acc
    }, [] as string[])
    .sort()

  return { categories, topics: topicsSorted }
}
