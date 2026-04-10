import { Testimony } from "components/db"
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
  titleI18nKey: "titles.testimony",
  Page: () => {
    useSyncQueryParameters()
    return <TestimonyDetailPage />
  }
})

const useSyncQueryParameters = () => {
  const { version } = useCurrentTestimonyDetails()
  useEffect(() => {
    const query = Query.parse(Router.query)
    const parts: Array<any> = [...query.testimonyDetail]
    const currentVersion =
      typeof parts[parts.length - 1] === "number" ? parts.pop() : undefined

    parts.push(version)
    if (currentVersion !== version)
      Router.push(
        {
          pathname: `/testimony/${parts.join("/")}`,
          query: query.ballotQuestionId
            ? { ballotQuestionId: query.ballotQuestionId }
            : undefined
        },
        undefined,
        { shallow: true }
      )
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
    ballotQuestionId: z.string().min(1).optional(),
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
      return {
        params,
        publishedId: params[0],
        ballotQuestionId: q.data.ballotQuestionId
      }
    case 2:
      return {
        params,
        publishedId: params[0],
        version: params[1],
        ballotQuestionId: q.data.ballotQuestionId
      }
    case 3:
      return {
        params,
        authorUid: params[0],
        court: params[1],
        billId: params[2],
        ballotQuestionId: q.data.ballotQuestionId
      }
    case 4:
      return {
        params,
        authorUid: params[0],
        court: params[1],
        billId: params[2],
        version: params[3],
        ballotQuestionId: q.data.ballotQuestionId
      }
  }
}

const notFound = { notFound: true } as const

const fetchDocs = async (q: NonNullable<ReturnType<typeof parseQuery>>) => {
  const db = dbService()

  let billId: string,
    court: number,
    authorUid: string,
    ballotQuestionId: string | undefined,
    archive: Testimony[],
    testimony: Testimony

  if (q.publishedId) {
    const doc = await db.getPublishedTestimony({ publishedId: q.publishedId })
    if (!doc) return

    testimony = doc
    ;({ billId, court, authorUid } = testimony)
    ballotQuestionId = testimony.ballotQuestionId ?? undefined
    archive = await db.getArchivedTestimony({
      authorUid,
      billId,
      court,
      ballotQuestionId
    })
  } else if (q.authorUid) {
    ;({ authorUid, billId, court, ballotQuestionId } = q)
    archive = await db.getArchivedTestimony({
      authorUid,
      billId,
      court,
      ballotQuestionId
    })

    const latest = first(archive)
    if (!latest) return
    testimony = latest
  } else {
    return
  }

  const bill = await db.getBill({ billId, court }),
    author = await db.getProfile({ uid: authorUid }),
    ballotQuestion = ballotQuestionId
      ? await db.getBallotQuestion({ id: ballotQuestionId })
      : null

  if (!bill) return

  return { bill, author, archive, testimony, ballotQuestion }
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
        redirect: {
          destination: q.ballotQuestionId
            ? `${destination}?ballotQuestionId=${encodeURIComponent(
                q.ballotQuestionId
              )}`
            : destination,
          permanent: false
        }
      }
    } else if (q.version > docs.testimony.version) return notFound

    store.dispatch(
      pageDataLoaded({
        testimony: docs.testimony,
        bill: docs.bill,
        ballotQuestion: docs.ballotQuestion ?? null,
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
