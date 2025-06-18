import { BillTopic, CATEGORIES_BY_TOPIC } from "../../../common/bills/types"

// The ML model will return a list of topics without categories
// We need to enrich the topics with the associated topic categories for the hierachical facets
export const assignCategoriesToTopics = (billTopics: string[]) => {
  return billTopics.reduce((acc, topic) => {
    const category = CATEGORIES_BY_TOPIC[topic]
    if (category) {
      acc.push({ category, topic })
    } else {
      console.error(`No category found for topic ${topic}`)
    }
    return acc
  }, [] as BillTopic[])
}
