import hash from "object-hash"

let mockAiplatformLoaded = false
jest.mock("@google-cloud/aiplatform", () => {
  mockAiplatformLoaded = true
  return {}
})

describe("vector indexer", () => {
  /** Every function shares one bundle, so a top-level import of the Vertex AI
   * client loads it into each of them, which pushed them all past their
   * default 256 MiB memory limit and none could start. */
  it("doesn't load the Vertex AI client when the functions bundle loads", () => {
    process.env.GCLOUD_PROJECT ??= "demo-dtp"
    jest.isolateModules(() => {
      require("../index")
    })
    expect(mockAiplatformLoaded).toBe(false)
  })

  it("hashes the same input as the deployed trigger did", () => {
    const { embeddingInput } = require("./createVectorIndexer")
    const { billVectorConfig } = require("./vectorConfigs")
    const bill = { content: { Title: "An Act", DocumentText: "Text" } }
    // Changing this hash would make the trigger re-embed every document.
    expect(embeddingInput(billVectorConfig, bill)).toEqual({
      text: "An Act\n\nText",
      title: "An Act",
      hash: hash({ textToEmbed: "An Act\n\nText", title: "An Act" })
    })
    expect(embeddingInput(billVectorConfig, { content: {} })).toBeNull()
  })
})
