import { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { fetchClientList } from "components/db/lobbying"
import { LIST_REVALIDATE_SECONDS } from "components/lobbying/listPageProps"

const QuerySchema = z.object({
  session: z.union([
    z.literal("all"),
    z
      .string()
      .regex(/^\d{3}$/)
      .transform(Number)
  ])
})

/**
 * Clients list rows for one legislative session, or "all", for the lobbying
 * explorer's Clients tab (which prerenders only the latest session's),
 * cached at the CDN for a day so each is read from Firestore at most once
 * per revalidation window.
 * /lobbying/clients/[session]
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end()
  const query = QuerySchema.safeParse(req.query)
  if (!query.success) return res.status(400).end()

  const { rows } = await fetchClientList(query.data.session)
  res.setHeader(
    "Cache-Control",
    `public, s-maxage=${LIST_REVALIDATE_SECONDS}, stale-while-revalidate=${LIST_REVALIDATE_SECONDS}`
  )
  return res.status(200).json(rows)
}
