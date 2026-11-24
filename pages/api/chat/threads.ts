import { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { createThread, listThreads, signedInUid } from "components/chat/server"

const Create = z.object({ title: z.string().trim().min(1).max(2000) })

/**
 * GET: the signed-in user's threads for the rail. POST {title}: create a thread stamped with
 * owner and title before its first run.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const uid = await signedInUid(req)
  if (!uid) return res.status(401).end()

  if (req.method === "GET") return res.status(200).json(await listThreads(uid))

  if (req.method === "POST") {
    const body = Create.safeParse(req.body)
    if (!body.success) return res.status(400).end()
    return res
      .status(201)
      .json(await createThread(uid, body.data.title.slice(0, 60)))
  }

  return res.status(405).end()
}
