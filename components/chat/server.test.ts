/** @jest-environment node */
import type { NextApiRequest } from "next"

jest.mock("components/server-api/init-firebase-admin", () => ({
  auth: {
    verifyIdToken: jest.fn(async (token: string) => {
      if (token !== "good") throw new Error("invalid token")
      return { uid: "uid-1" }
    })
  }
}))

import { signedInUid } from "./server"

const req = (authorization?: string) =>
  ({ headers: authorization ? { authorization } : {} } as NextApiRequest)

test("the uid comes only from a verified Firebase ID token", async () => {
  expect(await signedInUid(req("Bearer good"))).toBe("uid-1")
  expect(await signedInUid(req("Bearer forged"))).toBeNull()
  expect(await signedInUid(req("good"))).toBeNull()
  expect(await signedInUid(req())).toBeNull()
})
