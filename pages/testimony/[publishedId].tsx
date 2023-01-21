import { dbService } from "components/db/api"
import { wrapper } from "components/store"
import {
  pageDataLoaded,
  TestimonyDetailPage
} from "components/testimony/TestimonyDetailPage"
import { z } from "zod"
import { createPage } from "../../components/page"

export default createPage({
  title: "Testimony",
  Page: TestimonyDetailPage
})

const Query = z.object({ publishedId: z.string() })

export const getServerSideProps = wrapper.getServerSideProps(
  store => async ctx => {
    ctx.res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=59"
    )

    const q = Query.safeParse(ctx.query)
    if (!q.success) return { notFound: true }

    const { publishedId } = q.data
    const db = dbService()

    const testimony = await db.getPublishedTestimony({ publishedId })
    if (!testimony) return { notFound: true }

    const { authorUid, billId, court } = testimony

    const bill = await db.getBill({ billId, court }),
      author = await db.getProfile({ uid: authorUid }),
      archive = await db.getArchivedTestimony({ authorUid, billId, court })

    if (!bill || !archive.length) {
      console.log("Expected bill and arhive for testimony", publishedId)
      return { notFound: true }
    }

    store.dispatch(
      pageDataLoaded({ testimony, bill, author: author ?? null, archive })
    )
    return { props: {} }
  }
)
