import { useState, useRef, useEffect } from "react"
import { httpsCallable } from "firebase/functions"
import { functions } from "components/firebase"
import { useAuth } from "components/auth"
import styles from "./ChatWidget.module.css"

type AskQuestionRequest = { question: string }
type AskQuestionResponse = {
  answer: string
  usage: { tokensUsed: number; isLoggedIn: boolean }
}

const askQuestion = httpsCallable<AskQuestionRequest, AskQuestionResponse>(
  functions,
  "askQuestion"
)

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

/**
 * Lightweight bill/policy Q&A chat widget backed by the LangGraph ReAct
 * agent (functions/src/llm). Dependency-free beyond firebase/functions, so
 * it can be dropped into any page.
 */
export function ChatWidget({ title = "Ask about bills & policy" }: { title?: string }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "user", content: question }])
    setInput("")
    setLoading(true)
    setError(null)

    try {
      const result = await askQuestion({ question })
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: result.data.answer }
      ])
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h3>{title}</h3>
        {!user && <p className={styles.hint}>Sign in for a higher daily usage limit.</p>}
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <p className={styles.welcome}>
            Ask a question about a bill, testimony, or ballot question.
          </p>
        )}
        {messages.map(message => (
          <div key={message.id} className={`${styles.message} ${styles[message.role]}`}>
            {message.content}
          </div>
        ))}
        {loading && <div className={`${styles.message} ${styles.assistant}`}>Thinking…</div>}
        {error && <div className={styles.error}>{error}</div>}
        <div ref={endRef} />
      </div>

      <form className={styles.inputRow} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. What bills address education funding?"
          disabled={loading}
        />
        <button className={styles.submit} type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatWidget
