import { assignCategoriesToTopics } from "./topicParser"

describe("assignCategoriesToTopics", () => {
  it("assigns categories to topics", () => {
    const topics = [
      "Consumer protection",
      "Correctional facilities",
      "Property crimes"
    ]
    const categories = assignCategoriesToTopics(topics)
    expect(categories).toEqual([
      { category: "Commerce", topic: "Consumer protection" },
      {
        category: "Crime and Law Enforcement",
        topic: "Correctional facilities"
      },
      { category: "Crime and Law Enforcement", topic: "Property crimes" }
    ])
  })

  it("ignores topics with missing categories", () => {
    const topics = ["Consumer protection", "Unknown topic"]
    const categories = assignCategoriesToTopics(topics)
    expect(categories).toEqual([
      { category: "Commerce", topic: "Consumer protection" }
    ])
  })
})
