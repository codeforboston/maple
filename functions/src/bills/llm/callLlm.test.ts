import OpenAI from "openai"
import { callLlm } from "./callLlm"
import { emptyBillDetails } from "./types"

const makeClient = (
  embedText: (text: string) => number[] = () => [1, 0, 0]
) => {
  const chatCreate = jest.fn(
    async (
      _args: unknown
    ): Promise<{ choices: { message: { content: string | null } }[] }> => ({
      choices: [{ message: { content: "model answer" } }]
    })
  )
  const embeddingsCreate = jest.fn(
    async (args: { input: string | string[] }) => ({
      data: [args.input].flat().map(text => ({ embedding: embedText(text) }))
    })
  )
  const client = {
    chat: { completions: { create: chatCreate } },
    embeddings: { create: embeddingsCreate }
  } as unknown as OpenAI
  return { client, chatCreate, embeddingsCreate }
}

describe("callLlm", () => {
  it("sends a small prompt as one user message with fixed settings", async () => {
    const { client, chatCreate, embeddingsCreate } = makeClient()

    const result = await callLlm(
      emptyBillDetails(),
      "the prompt",
      "small",
      client
    )

    expect(result).toEqual({ query: "the prompt", response: "model answer" })
    expect(chatCreate).toHaveBeenCalledTimes(1)
    expect(chatCreate).toHaveBeenCalledWith({
      model: "gpt-4o-mini",
      temperature: 0,
      seed: 42,
      messages: [{ role: "user", content: "the prompt" }]
    })
    expect(embeddingsCreate).not.toHaveBeenCalled()
  })

  it("returns an empty response when the model returns no content", async () => {
    const { client, chatCreate } = makeClient()
    chatCreate.mockResolvedValueOnce({
      choices: [{ message: { content: null } }]
    })

    const result = await callLlm(emptyBillDetails(), "p", "small", client)

    expect(result.response).toBe("")
  })

  it("retrieves the most relevant MGL text for a large bill", async () => {
    // Embeds by which word dominates, so a query about "alpha" retrieves the
    // alpha chunks before the others.
    const embedText = (text: string) => [
      text.split("alpha").length - 1,
      text.split("beta").length - 1,
      text.split("gamma").length - 1
    ]
    const { client, chatCreate } = makeClient(embedText)
    const mglRef = `${"gamma ".repeat(2500)}${"beta ".repeat(
      2500
    )}${"alpha ".repeat(2500)}`

    const result = await callLlm(
      emptyBillDetails({ billText: "short bill", mglRef }),
      "Summarize alpha",
      "large",
      client
    )

    expect(result).toEqual({
      query: "Summarize alpha",
      response: "model answer"
    })
    const prompt = (
      chatCreate.mock.calls[0][0] as {
        messages: { content: string }[]
      }
    ).messages[0].content
    expect(prompt).toContain("You are a trustworthy assistant for this task.")
    expect(prompt).toContain("Bill Details: Summarize alpha")
    const context = prompt
      .split("Relevant Massachussets General Law section text for context: ")[1]
      .split("\n\n        Bill Details:")[0]
    expect(context.trimStart().startsWith("alpha")).toBe(true)
    expect(context.split("\n\n")[0]).not.toContain("gamma")
    expect(context.split("\n\n").length).toBeLessThanOrEqual(7)
  })

  it("sends a large prompt with no retrieved text when the bill has no room for any", async () => {
    const { client, chatCreate, embeddingsCreate } = makeClient()

    await callLlm(
      emptyBillDetails({
        billText: "word ".repeat(126000),
        mglRef: "some mgl"
      }),
      "q",
      "large",
      client
    )

    expect(embeddingsCreate).not.toHaveBeenCalled()
    expect(chatCreate).toHaveBeenCalledTimes(1)
  })
})
