import { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { fetchBillRows } from "components/db/lobbying"
import { LIST_REVALIDATE_SECONDS } from "components/lobbying/listPageProps"

const QuerySchema = z.object({
  court: z
    .string()
    .regex(/^\d{3}$/)
    .transform(Number)
})

/**
 * Bill rows for one legislative session of the lobbying explorer's Bills tab,
 * cached at the CDN for a day so each session is read from Firestore at most
 * once per revalidation window.
 * /lobbying/bills/[court]
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end()
  const query = QuerySchema.safeParse(req.query)
  if (!query.success) return res.status(400).end()

  const rows = await fetchBillRows(query.data.court)
  res.setHeader(
    "Cache-Control",
    `public, s-maxage=${LIST_REVALIDATE_SECONDS}, stale-while-revalidate=${LIST_REVALIDATE_SECONDS}`
  )
  return res.status(200).json(rows)
}
