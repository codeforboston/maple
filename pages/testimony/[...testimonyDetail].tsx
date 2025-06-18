import { Testimony } from "common/testimony/types"
import { dbService } from "components/db/api"
import { wrapper } from "components/store"
import {
  pageDataLoaded,
  TestimonyDetailPage,
  useCurrentTestimonyDetails
} from "components/testimony/TestimonyDetailPage"
import { first } from "lodash"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import Router from "next/router"
import { ParsedUrlQuery } from "querystring"
import { useEffect } from "react"
import { z } from "zod"
import { createPage } from "../../components/page"

export default createPage({
  title: "Testimony",
  Page: () => {
    useSyncQueryParameters()
    return <TestimonyDetailPage />
  }
})

const useSyncQueryParameters = () => {
  const { version } = useCurrentTestimonyDetails()
  useEffect(() => {
    const parts: Array<any> = Query.parse(Router.query).testimonyDetail
    const currentVersion = parts.pop()
    parts.push(version)
    if (currentVersion !== version)
      Router.push(`/testimony/${parts.join("/")}`, undefined, { shallow: true })
  }, [version])
}

// testimony/test-id
// testimony/test-id/1
// testimony/uid/193/h123/1
// testimony/uid/193/h123
const PublishedId = z.string().min(1),
  UserId = z.string().min(1),
  Court = z.coerce.number(),
  BillId = z.string().min(1),
  Version = z.coerce.number().positive(),
  Query = z.object({
    testimonyDetail: z.union([
      z.tuple([PublishedId]),
      z.tuple([PublishedId, Version]),
      z.tuple([UserId, Court, BillId, Version]),
      z.tuple([UserId, Court, BillId])
    ])
  })

const parseQuery = (query: ParsedUrlQuery) => {
  const q = Query.safeParse(query)
  if (!q.success) return

  const params = q.data.testimonyDetail

  switch (params.length) {
    case 1:
      return { params, publishedId: params[0] }
    case 2:
      return { params, publishedId: params[0], version: params[1] }
    case 3:
      return {
        params,
        authorUid: params[0],
        court: params[1],
        billId: params[2]
      }
    case 4:
      return {
        params,
        authorUid: params[0],
        court: params[1],
        billId: params[2],
        version: params[3]
      }
  }
}

const notFound = { notFound: true } as const

const fetchDocs = async (q: NonNullable<ReturnType<typeof parseQuery>>) => {
  const db = dbService()

  let billId: string,
    court: number,
    authorUid: string,
    archive: Testimony[],
    testimony: Testimony

  if (q.publishedId) {
    const doc = await db.getPublishedTestimony({ publishedId: q.publishedId })
    if (!doc) return

    testimony = doc
    ;({ billId, court, authorUid } = testimony)
    archive = await db.getArchivedTestimony({ authorUid, billId, court })
  } else if (q.authorUid) {
    ;({ authorUid, billId, court } = q)
    archive = await db.getArchivedTestimony({ authorUid, billId, court })

    const latest = first(archive)
    if (!latest) return
    testimony = latest
  } else {
    return
  }

  const bill = await db.getBill({ billId, court }),
    author = await db.getProfile({ uid: authorUid })

  if (!bill) return

  return { bill, author, archive, testimony }
}

export const getServerSideProps = wrapper.getServerSideProps(
  store => async ctx => {
    ctx.res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=59"
    )

    const q = parseQuery(ctx.query)

    if (!q) return notFound
    const docs = await fetchDocs(q)

    console.log("docs", docs)

    if (!docs) return notFound
    else if (!q.version) {
      const destination = [
        "/testimony",
        ...q.params,
        docs.testimony.version
      ].join("/")
      return {
        redirect: { destination, permanent: false }
      }
    } else if (q.version > docs.testimony.version) return notFound

    store.dispatch(
      pageDataLoaded({
        testimony: docs.testimony,
        bill: docs.bill,
        author: docs.author ?? null,
        archive: docs.archive,
        version: q.version
      })
    )

    const locale = ctx.locale as string

    return {
      props: {
        ...(await serverSideTranslations(locale, [
          "auth",
          "common",
          "footer",
          "testimony"
        ]))
      }
    }
  }
)
