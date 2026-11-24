/** @jest-environment node */
import type { NextApiRequest, NextApiResponse } from "next"

jest.mock("components/chat/server", () => ({
  signedInUid: jest.fn(async () => "u-1"),
  listThreads: jest.fn(async () => []),
  createThread: jest.fn(),
  agent: jest.fn(async () => ({ ok: true })),
  agentHeaders: jest.fn(() => ({})),
  agentUrl: jest.fn(() => "http://agent.test")
}))
// The runtime route's CopilotKit imports are ESM; the gate runs before they are used.
jest.mock("@ag-ui/client", () => ({ HttpAgent: class {} }))
jest.mock(
  "@copilotkit/runtime/v2",
  () => ({
    CopilotRuntime: class {},
    createCopilotRuntimeHandler: () => () => {}
  }),
  { virtual: true }
)
jest.mock(
  "@copilotkit/runtime/v2/node",
  () => ({ createCopilotNodeHandler: () => jest.fn() }),
  {
    virtual: true
  }
)

import threads from "../../pages/api/chat/threads"
import messages from "../../pages/api/chat/threads/[id]/messages"
import copilotkit from "../../pages/api/copilotkit/[...slug]"

const server = jest.requireMock("components/chat/server")
const THREAD = "11111111-1111-4111-8111-111111111111"

function call(
  handler: (req: NextApiRequest, res: NextApiResponse) => unknown,
  req: Partial<NextApiRequest>
) {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(body: unknown) {
      this.body = body
      return this
    },
    end() {
      return this
    },
    setHeader: jest.fn()
  }
  return Promise.resolve(
    handler({ headers: {}, ...req } as NextApiRequest, res as any)
  ).then(() => res)
}

beforeEach(() => jest.clearAllMocks())

test("not signed in: threads, messages and the runtime return 401", async () => {
  server.signedInUid.mockResolvedValue(null)
  expect((await call(threads, { method: "GET" })).statusCode).toBe(401)
  expect(
    (await call(messages, { method: "GET", query: { id: THREAD } })).statusCode
  ).toBe(401)
  expect((await call(copilotkit as any, { method: "POST" })).statusCode).toBe(
    401
  )
  server.signedInUid.mockResolvedValue("u-1")
})

test("thread create uses the signed-in uid as owner and a 60-char title", async () => {
  server.createThread.mockResolvedValue({ id: "t-1" })
  const res = await call(threads, {
    method: "POST",
    body: { title: "x".repeat(80), owner: "someone-else" }
  })
  expect(res.statusCode).toBe(201)
  expect(res.body).toEqual({ id: "t-1" })
  expect(server.createThread).toHaveBeenCalledWith("u-1", "x".repeat(60))
})

test.each([
  "/api/copilotkit/threads?agentId=ask_maple",
  "/api/copilotkit/threads/t-1/messages",
  "/api/copilotkit/threads/clear",
  "/api/copilotkit/memories",
  "/api/copilotkit/agent/other_agent/run",
  "/api/copilotkit/agent/ask_maple/connect",
  "/api/copilotkit"
])(
  "the runtime route only forwards the chat's own endpoints: %s is 404",
  async url => {
    const res = await call(copilotkit as any, { method: "GET", url })
    expect(res.statusCode).toBe(404)
  }
)

test("the runtime route overwrites a client-sent user header", async () => {
  const req = {
    method: "POST",
    url: "/api/copilotkit/agent/ask_maple/run",
    headers: { "x-ask-maple-user": "spoofed" }
  }
  await call(copilotkit as any, req)
  expect(req.headers["x-ask-maple-user"]).toBe("u-1")
})

test("Stop also sets the service's cancel flag for that thread", async () => {
  await call(copilotkit as any, {
    method: "POST",
    url: `/api/copilotkit/agent/ask_maple/stop/${THREAD}`
  })
  expect(server.agent).toHaveBeenCalledWith(`/threads/${THREAD}/stop`, "u-1", {
    method: "POST"
  })
})

test("Stop on a thread the service says isn't ours is 404 before the runtime's own stop", async () => {
  server.agent.mockResolvedValueOnce({ ok: false, status: 404 })
  const res = await call(copilotkit as any, {
    method: "POST",
    url: `/api/copilotkit/agent/ask_maple/stop/${THREAD}`
  })
  expect(res.statusCode).toBe(404)
})
