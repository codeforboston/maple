import { dbService } from "components/db/api"
import { firestore } from "components/firebase"
import { doc, getDoc } from "firebase/firestore"
import { GetServerSideProps } from "next"
import { z } from "zod"
import { BallotQuestionDetails } from "../../components/ballotquestions/BallotQuestionDetails"
import { BallotQuestion, Bill } from "../../components/db"
import { createPage } from "../../components/page"
import { usePublishService } from "../../components/publish/hooks"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

type Hearing = {
  id: string
  videoURL?: string
  content: {
    startsAt: string | number | Date
  }
}

const Query = z.object({ id: z.string() })

async function getHearing(id: string): Promise<Hearing | null> {
  const snap = await getDoc(doc(firestore, "events", `hearing-${id}`))
  return snap.exists() ? (snap.data() as Hearing) : null
}

export default createPage<{
  ballotQuestion: BallotQuestion
  bill: Bill | null
  hearings: Hearing[]
}>({
  titleI18nKey: "titles.ballotQuestion",
  Page: ({ ballotQuestion, bill, hearings }) => {
    return (
      <>
        <usePublishService.Provider />
        <BallotQuestionDetails
          ballotQuestion={ballotQuestion}
          bill={bill}
          hearings={hearings}
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
