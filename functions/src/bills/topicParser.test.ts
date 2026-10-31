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

  it("returns nothing for an empty list", () => {
    expect(assignCategoriesToTopics([])).toEqual([])
  })

  it("ignores a topic that is not in the taxonomy", () => {
    expect(assignCategoriesToTopics(["This shouldn't be a category"])).toEqual(
      []
    )
  })

  it("assigns categories across categories, in order", () => {
    expect(
      assignCategoriesToTopics([
        "Banking and financial institutions regulation",
        "Soil pollution"
      ])
    ).toEqual([
      {
        topic: "Banking and financial institutions regulation",
        category: "Commerce"
      },
      { topic: "Soil pollution", category: "Environmental Protection" }
    ])
  })
})
