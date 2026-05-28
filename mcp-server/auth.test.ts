/**
 * Unit tests for hybridAuthMiddleware.
 *
 * firebase-admin is fully mocked so no real Firebase project is required.
 */

// ---------------------------------------------------------------------------
// Mock firebase-admin before importing auth.ts
// ---------------------------------------------------------------------------
const mockVerifyIdToken = jest.fn()
const mockGet = jest.fn()
const mockDoc = jest.fn(() => ({ get: mockGet }))
const mockCollection = jest.fn(() => ({ doc: mockDoc }))

jest.mock("firebase-admin", () => ({
  auth: () => ({ verifyIdToken: mockVerifyIdToken }),
  firestore: () => ({ collection: mockCollection })
}))

import { hybridAuthMiddleware } from "./auth"
import { Request, Response, NextFunction } from "express"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeReq(authHeader?: string): Partial<Request> {
  return {
    headers: authHeader ? { authorization: authHeader } : {}
  }
}

function makeRes(): {
  res: Partial<Response>
  json: jest.Mock
  status: jest.Mock
} {
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })
  return { res: { status } as any, json, status }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("hybridAuthMiddleware", () => {
  let next: NextFunction

  beforeEach(() => {
    jest.clearAllMocks()
    next = jest.fn()
  })

  // -------------------------------------------------------------------------
  // Missing / malformed token
  // -------------------------------------------------------------------------

  it("rejects requests with no Authorization header", async () => {
    const req = makeReq()
    const { res, status, json } = makeRes()

    await hybridAuthMiddleware(req as Request, res as Response, next)

    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ error: "Unauthorized: Missing token" })
    expect(next).not.toHaveBeenCalled()
  })

  it("rejects requests whose Authorization header lacks the Bearer prefix", async () => {
    const req = makeReq("some-token-without-bearer")
    const { res, status, json } = makeRes()

    await hybridAuthMiddleware(req as Request, res as Response, next)

    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ error: "Unauthorized: Missing token" })
    expect(next).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Firebase ID Token path
  // -------------------------------------------------------------------------

  it("accepts a valid Firebase ID Token", async () => {
    const decodedToken = { uid: "user-123", email: "alice@example.com" }
    mockVerifyIdToken.mockResolvedValueOnce(decodedToken)

    const req = makeReq("Bearer valid-firebase-token") as any
    const { res } = makeRes()

    await hybridAuthMiddleware(req as Request, res as Response, next)

    expect(mockVerifyIdToken).toHaveBeenCalledWith("valid-firebase-token")
    expect(req.user).toEqual(decodedToken)
    expect(next).toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Agent Key path
  // -------------------------------------------------------------------------

  it("accepts an active Agent Key when Firebase token verification fails", async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error("invalid token"))
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ name: "test-agent", active: true })
    })

    const req = makeReq("Bearer agent-key-abc") as any
    const { res } = makeRes()

    await hybridAuthMiddleware(req as Request, res as Response, next)

    expect(mockDoc).toHaveBeenCalledWith("agent-key-abc")
    expect(req.agent).toEqual({ name: "test-agent", active: true })
    expect(next).toHaveBeenCalled()
  })

  it("rejects an inactive Agent Key with 403", async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error("invalid token"))
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ name: "disabled-agent", active: false })
    })

    const req = makeReq("Bearer disabled-key")
    const { res, status, json } = makeRes()

    await hybridAuthMiddleware(req as Request, res as Response, next)

    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({
      error: "Forbidden: Agent key is inactive"
    })
    expect(next).not.toHaveBeenCalled()
  })

  it("rejects a token that is neither a valid Firebase token nor an Agent Key", async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error("invalid token"))
    mockGet.mockResolvedValueOnce({ exists: false })

    const req = makeReq("Bearer unknown-token")
    const { res, status, json } = makeRes()

    await hybridAuthMiddleware(req as Request, res as Response, next)

    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ error: "Unauthorized: Invalid token" })
    expect(next).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // No query-param fallback (security: Mephistic comment #4)
  // -------------------------------------------------------------------------

  it("does NOT accept a token supplied as a query parameter", async () => {
    // Simulate a request where the token is in the query string only
    const req: Partial<Request> = {
      headers: {},
      query: { token: "query-param-token" }
    }
    const { res, status, json } = makeRes()

    await hybridAuthMiddleware(req as Request, res as Response, next)

    // Should be rejected — no Bearer header present
    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ error: "Unauthorized: Missing token" })
    expect(next).not.toHaveBeenCalled()
  })
})
