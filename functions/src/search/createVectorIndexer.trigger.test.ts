import * as admin from "firebase-admin"
import { createVectorIndexer, embeddingInput } from "./createVectorIndexer"
import { billVectorConfig } from "./vectorConfigs"

const mockPredict = jest.fn()
jest.mock("@google-cloud/aiplatform", () => ({
  PredictionServiceClient: jest.fn(() => ({ predict: mockPredict })),
  helpers: { toValue: (v: unknown) => v, fromValue: (v: unknown) => v }
}))

const trigger = createVectorIndexer(billVectorConfig)

const bill = (title: string, text: string, extra: object = {}) => ({
  content: { Title: title, DocumentText: text },
  ...extra
})

/** Run the trigger on a write from `before` to `after` (null = absent),
 * returning the document's update() mock. */
async function write(before: object | null, after: object | null) {
  const update = jest.fn()
  const snapshot = (data: object | null) => ({
    exists: data !== null,
    data: () => data ?? undefined,
    ref: { update }
  })
  await trigger.run({
    data: { before: snapshot(before), after: snapshot(after) }
  } as any)
  return update
}

beforeAll(() => {
  if (!admin.apps.length) admin.initializeApp({ projectId: "demo-test" })
})

beforeEach(() => {
  mockPredict.mockReset()
  mockPredict.mockResolvedValue([
    { predictions: [{ embeddings: { values: [0.1, 0.2] } }] }
  ])
})

describe("vector-index trigger", () => {
  it("embeds a new document and stores the embedding and hash", async () => {
    const update = await write(null, bill("An Act", "Text"))

    expect(mockPredict).toHaveBeenCalledTimes(1)
    const request = mockPredict.mock.calls[0][0]
    expect(request.endpoint).toBe(
      "projects/demo-test/locations/us-central1/publishers/google/models/text-embedding-005"
    )
    expect(request.instances).toEqual([
      { content: "title: An Act | text: An Act\n\nText" }
    ])
    const fields = update.mock.calls[0][0]
    expect(fields.vector_embedding.toArray()).toEqual([0.1, 0.2])
    expect(fields.vector_embedding_hash).toBe(
      embeddingInput(billVectorConfig, bill("An Act", "Text"))!.hash
    )
  })

  it("doesn't embed again when its own write fires it", async () => {
    const original = bill("An Act", "Text")
    const { hash } = embeddingInput(billVectorConfig, original)!
    const update = await write(
      original,
      bill("An Act", "Text", {
        vector_embedding: [0.1, 0.2],
        vector_embedding_hash: hash
      })
    )
    expect(mockPredict).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it("re-embeds when the text changes", async () => {
    const { hash } = embeddingInput(billVectorConfig, bill("An Act", "Text"))!
    const stored = { vector_embedding: [0.1, 0.2], vector_embedding_hash: hash }
    const update = await write(
      bill("An Act", "Text", stored),
      bill("An Act", "New text", stored)
    )
    expect(mockPredict).toHaveBeenCalledTimes(1)
    expect(update.mock.calls[0][0].vector_embedding_hash).not.toBe(hash)
  })

  it("embeds a document whose embedding has no hash", async () => {
    // Documents embedded by earlier backfills have no hash.
    const update = await write(
      bill("An Act", "Text"),
      bill("An Act", "Text", { vector_embedding: [0.1, 0.2], history: [1] })
    )
    expect(mockPredict).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledTimes(1)
  })

  it("skips documents with no text, and deletes", async () => {
    expect(await write(null, { content: {} })).not.toHaveBeenCalled()
    expect(await write(bill("An Act", "Text"), null)).not.toHaveBeenCalled()
    expect(mockPredict).not.toHaveBeenCalled()
  })
})
