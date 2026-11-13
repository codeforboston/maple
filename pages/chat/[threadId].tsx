import { GetServerSideProps } from "next"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { requireAuth } from "components/auth/service"
import { AskMapleProvider } from "components/chat/AskMapleProvider"
import { chatFetch } from "components/chat/chatFetch"
import { ChatShell, dayLabel } from "components/chat/ChatShell"
import { ChatThread, setPendingQuestion } from "components/chat/ChatThread"
import type { RailThread } from "components/chat/ConversationRail"
import { createPage } from "components/page"

/** /chat/new and /chat/[threadId], for signed-in users. */
function ThreadPage() {
  const { t } = useTranslation("chat")
  const router = useRouter()
  const threadId = String(router.query.threadId)
  const [threads, setThreads] = useState<RailThread[]>([])
  const [railStatus, setRailStatus] = useState<"loading" | "error" | "ready">(
    "loading"
  )

  const loadRail = useCallback(async () => {
    const res = await chatFetch("/api/chat/threads").catch(() => null)
    if (!res?.ok) return setRailStatus("error")
    const rows: { id: string; title: string; updatedAt: string }[] =
      await res.json()
    setThreads(
      rows.map(r => ({
        id: r.id,
        title: r.title,
        updatedLabel: dayLabel(r.updatedAt, t("rail.today"))
      }))
    )
    setRailStatus("ready")
  }, [t])

  useEffect(() => {
    void loadRail()
  }, [loadRail])

  // The first question creates the thread (owner + title), then the URL becomes /chat/[id].
  const startThread = async (question: string) => {
    const res = await chatFetch("/api/chat/threads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: question })
    })
    if (!res.ok) throw new Error(`thread create failed: ${res.status}`)
    const { id } = await res.json()
    setPendingQuestion(question)
    await router.replace(`/chat/${id}`)
  }

  return (
    <AskMapleProvider>
      <ChatShell
        threads={threads}
        activeId={threadId}
        railStatus={railStatus}
        onRailRetry={loadRail}
      >
        <ChatThread
          key={threadId}
          threadId={threadId}
          resumeHref={threads[0] ? `/chat/${threads[0].id}` : undefined}
          onRunSettled={loadRail}
          onFirstQuestion={threadId === "new" ? startThread : undefined}
          onNotFound={() => void router.replace("/chat/new")}
        />
      </ChatShell>
    </AskMapleProvider>
  )
}

export default createPage({
  titleI18nKey: "navigation.askMaple",
  Page: requireAuth(ThreadPage)
})

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale ?? "en", [
    "auth",
    "chat",
    "common",
    "footer"
  ])
})
