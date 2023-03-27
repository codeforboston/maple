import { dbService } from "components/db/api"
import { wrapper } from "components/store"
import {
  pageDataLoaded,
  TestimonyDetailPage,
  useCurrentTestimonyDetails
} from "components/testimony/TestimonyDetailPage"
import Router from "next/router"
import { useEffect } from "react"
import { z } from "zod"
import { createPage } from "../../components/page"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

export default createPage({
  title: "Testimony",
  Page: () => {
    useSyncQueryParameters()
    return <TestimonyDetailPage />
  }
})

const useSyncQueryParameters = () => {
  const { version, publishedId } = useCurrentTestimonyDetails()
  useEffect(() => {
    Router.push(`/testimony/${publishedId}/${version}`, undefined, {
      shallow: true
    })
  }, [publishedId, version])
}

const PublishedId = z.string().min(1),
  Version = z.coerce.number().positive(),
  Query = z.object({
    testimonyDetail: z.tuple([PublishedId]).or(z.tuple([PublishedId, Version]))
  })

export const getServerSideProps = wrapper.getServerSideProps(
  store => async ctx => {
    ctx.res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=59"
    )

    const q = Query.safeParse(ctx.query)
    if (!q.success) return { notFound: true }

    const [publishedId, version] = q.data.testimonyDetail
    const db = dbService()

    const testimony = await db.getPublishedTestimony({ publishedId })
    if (!testimony) return { notFound: true }
    else if (!version)
      return {
        redirect: {
          destination: `/testimony/${publishedId}/${testimony.version}`,
          permanent: false
        }
      }
    else if (version > testimony.version) return { notFound: true }

    const { authorUid, billId, court } = testimony

    const bill = await db.getBill({ billId, court }),
      author = await db.getProfile({ uid: authorUid }),
      archive = await db.getArchivedTestimony({ authorUid, billId, court })

    if (!bill || !archive.length) {
      console.log("Expected bill and arhive for testimony", publishedId)
      return { notFound: true }
    }

    store.dispatch(
      pageDataLoaded({
        testimony,
        bill,
        author: author ?? null,
        archive,
        version
      })
    )

    const locale = ctx.locale as string

    return {
      props: { ...(await serverSideTranslations(locale, ["common", "footer"])) }
    }
  }
)
