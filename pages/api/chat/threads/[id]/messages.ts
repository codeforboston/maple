import { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { agent, signedInUid } from "components/chat/server"

/** A thread's history for page load (the service checks the owner; others get 404). */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end()
  const uid = await signedInUid(req)
  if (!uid) return res.status(401).end()
  const id = z.string().uuid().safeParse(req.query.id)
  if (!id.success) return res.status(404).end()

  const upstream = await agent(`/threads/${id.data}/messages`, uid)
  if (!upstream.ok) return res.status(upstream.status === 404 ? 404 : 502).end()
  return res.status(200).json(await upstream.json())
}
