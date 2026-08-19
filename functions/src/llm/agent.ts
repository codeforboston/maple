import { ChatOpenAI } from "@langchain/openai"
import { createReactAgent } from "@langchain/langgraph/prebuilt"
import { BaseMessage } from "@langchain/core/messages"
import { vectorSearchTools } from "./vectorSearchTools"
import { LLM_CONFIG } from "./config"

const SYSTEM_PROMPT = `You are a helpful assistant for the MAPLE platform, answering questions about Massachusetts legislation, testimony, and ballot questions.

Use the search tools to find relevant bills, testimony, and ballot questions before answering - do not rely on prior knowledge of specific bills. Cite bill numbers/IDs when you reference them. If the tools don't return relevant information, say so honestly rather than guessing.`

export interface AskAgentResult {
  answer: string
  tokensUsed: number
}

export async function askAgent(
  question: string,
  options: { recursionLimit: number; maxOutputTokens: number }
): Promise<AskAgentResult> {
  const llm = new ChatOpenAI({
    model: LLM_CONFIG.openaiModel,
    temperature: LLM_CONFIG.temperature,
    maxTokens: options.maxOutputTokens,
    apiKey: process.env.OPENAI_API_KEY
  })

  const reactAgent = createReactAgent({ llm, tools: vectorSearchTools })

  const result = await reactAgent.invoke(
    {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ]
    },
    { recursionLimit: options.recursionLimit }
  )

  const messages: BaseMessage[] = result.messages
  const lastMessage = messages[messages.length - 1]
  const answer =
    typeof lastMessage.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage.content)

  const tokensUsed = messages.reduce((sum, message) => {
    const usage = (message as any).usage_metadata
    return sum + (usage?.total_tokens ?? 0)
  }, 0)

  return { answer, tokensUsed }
}
