import { GetServerSideProps } from "next"
import { z } from "zod"
import { flags } from "components/featureFlags"
import { loadLanding } from "components/conference/load"
import { maple } from "components/links"

const Query = z.object({ court: z.coerce.number() })

/**
 * A session's address with no committee in it (/conferences/194) opens that
 * session's first committee, the one "See the committees" opens on the
 * Conference Committees page (loadLanding), rather than a bare 404.
 * Where the session has none, the Conference Committees page.
 */
export default function ConferenceSession() {
  return null
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  if (!flags().conferences) return { notFound: true }
  const query = Query.safeParse(ctx.query)
  if (!query.success) return { notFound: true }

  const landing = await loadLanding(query.data.court)
  return {
    redirect: {
      destination: landing ? maple.conference(landing) : maple.conferences(),
      permanent: false
    }
  }
}
