import { GetServerSideProps } from "next"
import { z } from "zod"
import { flags } from "components/featureFlags"
import { loadLandingPage } from "components/conference/load"
import { maple } from "components/links"

const Query = z.object({ court: z.coerce.number() })

/**
 * A session's address with no committee in it (/conferences/194) opens that
 * session's first committee, the one "See the committees" opens on the
 * Conference Committees page (loadLandingPage), rather than a bare 404.
 * Where the session has none, the Conference Committees page.
 */
export default function ConferenceSession() {
  return null
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  if (!flags().conferences) return { notFound: true }
  const query = Query.safeParse(ctx.query)
  if (!query.success) return { notFound: true }

  const page = await loadLandingPage(query.data.court)
  return {
    redirect: {
      destination: page
        ? maple.conference(page.conference)
        : maple.conferences(),
      permanent: false
    }
  }
}
