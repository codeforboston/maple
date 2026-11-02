import {
  GetStaticProps,
  GetStaticPropsContext,
  NextApiRequest,
  NextApiResponse
} from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { z } from "zod"

// The lobbying pages with data are prerendered and regenerated at most once a day
// (the scraper updates the data weekly), instead of every visitor reading
// thousands of summary docs from Firestore.
export const LIST_REVALIDATE_SECONDS = 24 * 60 * 60

/** getStaticProps for a lobbying page with data: its data plus translations,
 * regenerated daily. */
export function createLobbyingListProps<P extends Record<string, unknown>>(
  load: (context: GetStaticPropsContext) => Promise<P>
): GetStaticProps<P> {
  return async context => {
    const locale = context.locale ?? context.defaultLocale ?? "en"
    const [data, translations] = await Promise.all([
      load(context),
      serverSideTranslations(locale, ["auth", "common", "footer", "lobbying"])
    ])
    return {
      props: { ...data, ...translations },
      revalidate: LIST_REVALIDATE_SECONDS
    }
  }
}

const COURT = z
  .string()
  .regex(/^\d{3}$/)
  .transform(Number)

/**
 * An API route serving a lobbying list's rows for one session (a General
 * Court number) or, with `allowAll`, "all": what a list page loads for the
 * sessions it doesn't prerender. Cached at the CDN for as long as the pages
 * are, so each is read from Firestore at most once per revalidation window.
 */
export function createLobbyingListRoute<T>(
  param: string,
  load: (session: number | "all") => Promise<T>,
  { allowAll = true } = {}
) {
  const schema = z.object({
    [param]: allowAll ? z.union([z.literal("all"), COURT]) : COURT
  })
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).end()
    const query = schema.safeParse(req.query)
    if (!query.success) return res.status(400).end()

    const rows = await load(query.data[param] as number | "all")
    res.setHeader(
      "Cache-Control",
      `public, s-maxage=${LIST_REVALIDATE_SECONDS}, stale-while-revalidate=${LIST_REVALIDATE_SECONDS}`
    )
    return res.status(200).json(rows)
  }
}
