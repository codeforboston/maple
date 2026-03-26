import { dbService } from "components/db/api"
import { Testimony } from "components/db/testimony"
import { firestore } from "components/firebase"
import { collectionGroup, doc, getDoc, getDocs, query, where } from "firebase/firestore"
import { GetServerSideProps } from "next"
import { z } from "zod"
import { BallotQuestionDetails } from "../../components/ballotquestions/BallotQuestionDetails"
import {
  BallotQuestionTestimonySummary,
  Hearing
} from "../../components/ballotquestions/types"
import { BallotQuestion, Bill } from "../../components/db"
import { createPage } from "../../components/page"
import { usePublishService } from "../../components/publish/hooks"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

const Query = z.object({ id: z.string() })

async function getHearing(id: string): Promise<Hearing | null> {
  const snap = await getDoc(doc(firestore, "events", id))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    id,
    videoURL: data.videoURL ?? undefined,
    startsAt: data.startsAt?.toMillis() ?? 0
  }
}

export default createPage<{
  ballotQuestion: BallotQuestion
  bill: Bill | null
  hearings: Hearing[]
  testimonySummary: BallotQuestionTestimonySummary
}>({
  titleI18nKey: "titles.ballotQuestion",
  Page: ({ ballotQuestion, bill, hearings, testimonySummary }) => {
    return (
      <>
        <usePublishService.Provider />
        <BallotQuestionDetails
          ballotQuestion={ballotQuestion}
          bill={bill}
          hearings={hearings}
          testimonySummary={testimonySummary}
        />
      </>
    )
  }
})

export const getServerSideProps: GetServerSideProps = async ctx => {
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  )

  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"

  const query = Query.safeParse(ctx.query)
  if (!query.success) return { notFound: true }

  const ballotQuestion = await dbService().getBallotQuestion({ id: query.data.id })
  if (!ballotQuestion) return { notFound: true }

  let bill: Bill | null = null
  let hearings: Hearing[] = []
  const testimonySummary = await getBallotQuestionTestimonySummary(query.data.id)

  if (ballotQuestion.billId) {
    bill =
      (await dbService().getBill({
      court: ballotQuestion.court,
      billId: ballotQuestion.billId
      })) ?? null

    if (bill?.hearingIds?.length) {
      hearings = await Promise.all(
        bill.hearingIds.map(id => getHearing(id).catch(() => null))
      ).then(results => results.filter((h): h is Hearing => h !== null))
    }
  }

  return {
    props: {
      ballotQuestion: JSON.parse(JSON.stringify(ballotQuestion)),
      bill: bill ? JSON.parse(JSON.stringify(bill)) : null,
      hearings: JSON.parse(JSON.stringify(hearings)),
      testimonySummary,
      ...(await serverSideTranslations(locale, [
        "auth",
        "common",
        "footer",
        "testimony",
        "profile"
      ]))
    }
  }
}

async function getBallotQuestionTestimonySummary(
  ballotQuestionId: string
): Promise<BallotQuestionTestimonySummary> {
  const result = await getDocs(
    query(
      collectionGroup(firestore, "publishedTestimony"),
      where("ballotQuestionId", "==", ballotQuestionId)
    )
  )

  return result.docs.reduce<BallotQuestionTestimonySummary>(
    (summary, snap) => {
      const testimony = snap.data() as Testimony
      summary.testimonyCount += 1

      if (testimony.position === "endorse") summary.endorseCount += 1
      if (testimony.position === "neutral") summary.neutralCount += 1
      if (testimony.position === "oppose") summary.opposeCount += 1

      return summary
    },
    {
      testimonyCount: 0,
      endorseCount: 0,
      neutralCount: 0,
      opposeCount: 0
    }
  )
}
