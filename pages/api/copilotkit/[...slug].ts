import { HttpAgent } from "@ag-ui/client"
import {
  CopilotRuntime,
  createCopilotRuntimeHandler
} from "@copilotkit/runtime/v2"
import { createCopilotNodeHandler } from "@copilotkit/runtime/v2/node"
import { NextApiRequest, NextApiResponse } from "next"
import {
  agent,
  agentHeaders,
  agentUrl,
  signedInUid
} from "components/chat/server"

// The handler reads the raw request body itself. A turn streams for as long as the
// service's Cloud Run timeout (300 s), so Vercel must not cut it off sooner.
export const config = { api: { bodyParser: false }, maxDuration: 300 }

const USER_HEADER = "x-ask-maple-user"

/**
 * Only what the chat uses. The runtime's other routes (threads list/messages/clear, memories, ...)
 * would expose every user's in-memory threads to any signed-in user.
 */
const ALLOWED =
  /^\/api\/copilotkit\/(info|agent\/ask_maple\/(run|stop\/[0-9a-f-]{36}))$/
const STOP = /^\/api\/copilotkit\/agent\/ask_maple\/stop\/([0-9a-f-]{36})$/

const runtime = new CopilotRuntime({
  // Per request: the chat-agent service with the server-held token and the verified uid.
  // The service takes only the newest user message, so nothing else the browser sends matters.
  agents: ({ request }) => ({
    ask_maple: new HttpAgent({
      url: `${agentUrl()}/runs`,
      headers: agentHeaders(request.headers.get(USER_HEADER) ?? "")
    })
  })
})

const copilot = createCopilotNodeHandler(
  createCopilotRuntimeHandler({ runtime, basePath: "/api/copilotkit" })
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const uid = await signedInUid(req)
  if (!uid) return res.status(401).end()
  const path = new URL(req.url ?? "", "http://x").pathname
  if (!ALLOWED.test(path)) return res.status(404).end()
  req.headers[USER_HEADER] = uid // overwrites any client-sent value

  // Stop: the runtime aborts its stream to the service; also set the service's cancel flag
  // in case this request reached a different instance than the running one.
  // The runtime's own stop has no owner check, so a thread the service says isn't ours stops here.
  const stop = path.match(STOP)
  if (stop) {
    const flagged = await agent(`/threads/${stop[1]}/stop`, uid, {
      method: "POST"
    }).catch(err => console.error("stop flag failed", err))
    if (flagged?.status === 404) return res.status(404).end()
  }

  // Next.js gzips API responses, and gzip holds the event stream back until the run ends.
  // Its `compression` skips already-encoded responses, so progress and text stream live.
  res.setHeader("Content-Encoding", "none")
  return copilot(req, res)
}
