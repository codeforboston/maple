import { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { fetchDDUtterances } from "components/hearing/digitalDemocracyApi"

const QuerySchema = z.object({ hid: z.coerce.number() })

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(404).end()
    return
  }

  const query = QuerySchema.safeParse(req.query)
  if (!query.success) {
    res.status(400).json({ error: "Invalid hid" })
    return
  }

  const utterances = await fetchDDUtterances(query.data.hid)
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=3600"
  )
  res.status(200).json({ utterances })
}
