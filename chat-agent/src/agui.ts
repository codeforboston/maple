import { EventType, type BaseEvent, type Message } from "@ag-ui/core"
import {
  isAIMessage,
  isToolMessage,
  type BaseMessage
} from "@langchain/core/messages"

/** Text parts only: Gemini 3 can return content as blocks (thought signatures, etc.). */
export const textOf = (content: unknown): string =>
  typeof content === "string"
    ? content
    : Array.isArray(content)
    ? content
        .map(p =>
          p?.type === "text" && typeof p.text === "string" ? p.text : ""
        )
        .join("")
    : ""

/** Checkpoint messages in AG-UI form: for MESSAGES_SNAPSHOT and the history route. */
export function toAgUiMessages(messages: BaseMessage[]): Message[] {
  return messages.flatMap((m): Message[] => {
    if (m.type === "human")
      return [{ id: m.id!, role: "user", content: textOf(m.content) }]
    if (isToolMessage(m))
      return [
        {
          id: m.id!,
          role: "tool",
          toolCallId: m.tool_call_id,
          content: textOf(m.content)
        }
      ]
    if (isAIMessage(m)) {
      const toolCalls = (m.tool_calls ?? []).map(tc => ({
        id: tc.id!,
        type: "function" as const,
        function: { name: tc.name, arguments: JSON.stringify(tc.args) }
      }))
      return [
        {
          id: m.id!,
          role: "assistant",
          content: textOf(m.content),
          ...(toolCalls.length ? { toolCalls } : {})
        }
      ]
    }
    return []
  })
}

/**
 * Graph stream (streamMode ["messages", "updates"]) → AG-UI events.
 * Text streams token by token; tool calls and results arrive per finished step. The caller ends the
 * run with a MESSAGES_SNAPSHOT from the checkpoint, which corrects anything middleware changed after
 * streaming (trimmed tool batches, limit and budget notices).
 */
export async function* toAgUiEvents(
  stream: AsyncIterable<[string, unknown]>
): AsyncGenerator<BaseEvent> {
  let openText: string | undefined
  const announced = new Set<string>()
  const endText = (): BaseEvent[] => {
    if (!openText) return []
    const end = {
      type: EventType.TEXT_MESSAGE_END,
      messageId: openText
    } as BaseEvent
    openText = undefined
    return [end]
  }

  for await (const [mode, data] of stream) {
    if (mode === "messages") {
      const [chunk] = data as [BaseMessage]
      if (chunk?.type !== "ai") continue // AIMessage or AIMessageChunk
      const delta = textOf(chunk.content)
      if (!delta || !chunk.id) continue
      if (openText !== chunk.id) {
        yield* endText()
        openText = chunk.id
        yield {
          type: EventType.TEXT_MESSAGE_START,
          messageId: chunk.id,
          role: "assistant"
        } as BaseEvent
      }
      yield {
        type: EventType.TEXT_MESSAGE_CONTENT,
        messageId: chunk.id,
        delta
      } as BaseEvent
      continue
    }
    if (mode !== "updates" || !data) continue
    for (const update of Object.values(
      data as Record<string, { messages?: unknown }>
    )) {
      const messages = update?.messages
      if (!Array.isArray(messages)) continue
      for (const m of messages as BaseMessage[]) {
        if (isAIMessage(m)) {
          for (const tc of m.tool_calls ?? []) {
            if (!tc.id || announced.has(tc.id)) continue
            announced.add(tc.id)
            yield* endText()
            yield {
              type: EventType.TOOL_CALL_START,
              toolCallId: tc.id,
              toolCallName: tc.name,
              parentMessageId: m.id
            } as BaseEvent
            yield {
              type: EventType.TOOL_CALL_ARGS,
              toolCallId: tc.id,
              delta: JSON.stringify(tc.args)
            } as BaseEvent
            yield {
              type: EventType.TOOL_CALL_END,
              toolCallId: tc.id
            } as BaseEvent
          }
        } else if (isToolMessage(m)) {
          yield {
            type: EventType.TOOL_CALL_RESULT,
            messageId: m.id ?? `${m.tool_call_id}-result`,
            toolCallId: m.tool_call_id,
            content: textOf(m.content),
            role: "tool"
          } as BaseEvent
        }
      }
    }
  }
  yield* endText()
}
