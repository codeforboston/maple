import { chatFetch } from "./chatFetch"
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2/headless"
import { TFunction, useTranslation } from "next-i18next"
import { useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { AnswerMarkdown, plainText } from "./AnswerMarkdown"
import { BillRecords } from "./BillRecord"
import { formatBillNumber } from "./ChamberChip"
import {
  AnswerFailed,
  BudgetReached,
  EmptyChat,
  NoResultsNote
} from "./ChatStates"
import { Composer } from "./Composer"
import { ToolDisclosure } from "./ToolDisclosure"
import { toTurns, type AgUiMessage, type Step, type Turn } from "./turns"
import { WorkingSpinner } from "./WorkingSpinner"

const SLOW_MS = 30_000

const Work = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--maple-surface-base);
`

const Log = styled.div`
  flex: 1;
  overflow: auto;
  scrollbar-color: var(--maple-chat-tint-strong) transparent;
`

const Column = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 28px 24px 12px;

  @media (max-width: 820px) {
    padding: 20px 16px 8px;
  }
`

const TurnBox = styled.section`
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Ask = styled.p`
  margin: 0 0 0 auto;
  max-width: min(560px, 85%);
  width: fit-content;
  background: var(--maple-chat-tint);
  color: var(--maple-text-strong);
  padding: 12px 16px;
  border-radius: 14px 14px 4px 14px;
  font-size: 1.02rem;
  line-height: 1.5;
  white-space: pre-wrap;

  @media (max-width: 820px) {
    max-width: 92%;
  }
`

const Sr = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`

function stepLabel(t: TFunction, s: Step): string {
  const count = s.rows?.length ?? 0
  const query = String(s.args.query ?? "")
  const bill = s.args.billId ? formatBillNumber(String(s.args.billId)) : ""
  switch (s.name) {
    case "search_bills":
      return s.done
        ? t("steps.searchedBills", { query, count })
        : t("steps.searchingBills", { query })
    case "search_testimony":
      if (s.done)
        return bill
          ? t("steps.readTestimonyOn", { bill, count })
          : t("steps.readTestimony", { count })
      return bill
        ? t("steps.readingTestimonyOn", { bill })
        : t("steps.readingTestimony")
    case "list_sponsors":
      return s.done ? t("steps.sponsorsDone") : t("steps.sponsors")
    default:
      return s.done ? t("steps.pastChatsDone") : t("steps.pastChats")
  }
}

function summaryOf(t: TFunction, turn: Turn): string {
  const bills = new Set(
    turn.steps
      .filter(s => s.name === "search_bills")
      .flatMap(s => (s.rows ?? []).map(r => r.id))
  )
  const testified = new Set(
    turn.steps
      .filter(s => s.name === "search_testimony")
      .flatMap(s => (s.rows ?? []).map(r => r.billId))
  )
  const parts = []
  if (bills.size) parts.push(t("summary.bills", { count: bills.size }))
  if (testified.size)
    parts.push(t("summary.testimony", { count: testified.size }))
  return parts.join(", ")
}

const isBusyError = (err: unknown) =>
  /409|busy|inflight|already running|ALREADY_RUNNING/i.test(
    err instanceof Error ? err.message : JSON.stringify(err)
  )

/** Hands a question from /chat/new to the freshly created thread page across the client-side route change. */
let pendingQuestion: string | undefined
export const setPendingQuestion = (q: string) => {
  pendingQuestion = q
}

export function ChatThread({
  threadId,
  resumeHref,
  onRunSettled,
  onFirstQuestion,
  onNotFound
}: {
  /** "new": no thread yet; the first question creates one. */
  threadId: string
  resumeHref?: string
  /** Refresh the rail after a turn ends. */
  onRunSettled: () => void
  /** /chat/new only: create the thread for this question. */
  onFirstQuestion?: (question: string) => Promise<void>
  /** The thread is unknown or someone else's (the service answers 404 to both). */
  onNotFound: () => void
}) {
  const { t } = useTranslation("chat")
  const isNew = threadId === "new"
  const { agent, isReady } = useAgent({
    agentId: `ask_maple:${threadId}`,
    runtimeAgentId: "ask_maple",
    threadId
  })
  const { copilotkit } = useCopilotKit()
  const [failed, setFailed] = useState(false)
  const [notice, setNotice] = useState<string>()
  const [slow, setSlow] = useState(false)
  // /chat/new: the question whose thread could not be created, kept for Retry.
  const [newFailed, setNewFailed] = useState<string>()
  const [announcement, setAnnouncement] = useState("")
  const logRef = useRef<HTMLDivElement>(null)

  const turns = toTurns(agent.messages as AgUiMessage[])
  const running = agent.isRunning
  const last = turns.at(-1)
  const budgetReached = last?.answer === t("budget.reached")

  const stoppedRef = useRef(false)

  // Run errors arrive as AG-UI events inside a 200 stream, so runAgent() can resolve on failure.
  const run = useCallback(async () => {
    setFailed(false)
    setNotice(undefined)
    stoppedRef.current = false
    let runError: unknown
    const sub = agent.subscribe({
      onRunErrorEvent: ({ event }) => {
        runError = event
      },
      onRunFailed: ({ error }) => {
        runError = error
      }
    })
    try {
      await copilotkit.runAgent({ agent })
    } catch (err) {
      runError = err
    } finally {
      sub.unsubscribe()
    }
    if (stoppedRef.current) runError = undefined // Stop is not a failure
    if (runError && isBusyError(runError)) {
      // Another tab is answering. Drop the rejected question; that tab's answer arrives on reload.
      agent.setMessages(agent.messages.slice(0, -1))
      setNotice(t("composer.busy"))
    } else if (runError) {
      setFailed(true)
    } else {
      setAnnouncement(
        plainText(toTurns(agent.messages as AgUiMessage[]).at(-1)?.answer ?? "")
      )
    }
    onRunSettled()
  }, [agent, copilotkit, onRunSettled, t])

  const send = useCallback(
    (question: string) => {
      if (isNew) {
        setNewFailed(undefined)
        return void onFirstQuestion?.(question).catch(() =>
          setNewFailed(question)
        )
      }
      agent.addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: question
      })
      void run()
    },
    [agent, isNew, onFirstQuestion, run]
  )

  const sendRef = useRef(send)
  sendRef.current = send
  const notFoundRef = useRef(onNotFound)
  notFoundRef.current = onNotFound

  // Load the thread's history from the service, then send a question handed over from /chat/new.
  // In that order: setting the history would replace a question added before it.
  useEffect(() => {
    if (!isReady || isNew) return
    let live = true
    chatFetch(`/api/chat/threads/${threadId}/messages`)
      .then(res => {
        if (res.status === 404) notFoundRef.current()
        return res.ok ? res.json() : Promise.reject(res.status)
      })
      .then(history => {
        if (live) agent.setMessages(history)
      })
      .catch(() => live && setFailed(true))
      .then(() => {
        if (!live || !pendingQuestion) return
        const q = pendingQuestion
        pendingQuestion = undefined
        sendRef.current(q)
      })
    return () => {
      live = false
    }
  }, [isReady, isNew, agent, threadId])

  useEffect(() => {
    if (!running) return setSlow(false)
    const timer = setTimeout(() => setSlow(true), SLOW_MS)
    return () => clearTimeout(timer)
  }, [running])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [agent.messages.length, last?.answer.length, last?.steps.length])

  const stop = () => {
    stoppedRef.current = true
    copilotkit.stopAgent({ agent })
    setNotice(t("composer.stopped"))
  }

  const retry = () => {
    const question = last?.question
    if (question) send(question)
  }

  return (
    <Work aria-labelledby="chat-thread-title">
      <Sr as="h1" id="chat-thread-title">
        {turns[0]?.question || t("title")}
      </Sr>
      <Log ref={logRef}>
        <Column>
          {turns.length === 0 && !running && (
            <EmptyChat
              starters={
                t("empty.starters", { returnObjects: true }) as string[]
              }
              onStarter={send}
              resumeHref={resumeHref}
            />
          )}
          {newFailed && <AnswerFailed onRetry={() => send(newFailed)} />}
          {turns.map((turn, i) => {
            const current = i === turns.length - 1
            const working = current && running && !turn.answer
            const doneSteps = turn.steps.filter(s => s.done)
            const active = turn.steps.find(s => !s.done)
            return (
              <TurnBox key={turn.id} aria-label={turn.question}>
                <Ask>{turn.question}</Ask>
                {working ? (
                  <WorkingSpinner
                    done={doneSteps.map(s => stepLabel(t, s))}
                    current={
                      active ? stepLabel(t, active) : t("steps.thinking")
                    }
                  />
                ) : (
                  // A stopped turn may have steps but no results: nothing to disclose.
                  summaryOf(t, turn) && (
                    <ToolDisclosure
                      summary={summaryOf(t, turn)}
                      steps={turn.steps.map(s => ({
                        label: stepLabel(t, s),
                        items:
                          s.name === "search_bills"
                            ? (s.rows ?? []).map(r => ({
                                id: r.id,
                                title: r.title
                              }))
                            : undefined
                      }))}
                    />
                  )
                )}
                {turn.answer === t("budget.reached") ? (
                  <BudgetReached />
                ) : (
                  turn.answer && (
                    <AnswerMarkdown
                      text={turn.answer}
                      incomplete={current && failed}
                    />
                  )
                )}
                {!(current && running) && <BillRecords bills={turn.bills} />}
                {!(current && running) && turn.noResults && (
                  <NoResultsNote query={turn.question} />
                )}
                {current && failed && !running && (
                  <AnswerFailed onRetry={retry} />
                )}
              </TurnBox>
            )
          })}
        </Column>
      </Log>
      {/* Announce the finished answer once, never each streamed token. */}
      <Sr aria-live="polite">{announcement}</Sr>
      <Composer
        running={running}
        disabledReason={
          budgetReached ? t("budget.composerDisabled") : undefined
        }
        notice={running && slow ? t("working.slow") : notice}
        onSend={send}
        onStop={stop}
      />
    </Work>
  )
}
