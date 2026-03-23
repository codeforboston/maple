import { Container } from "components/bootstrap"
import { dbService } from "components/db"
import {
  BrowseBallotQuestions
} from "components/ballotquestions/BrowseBallotQuestions"
import type {
  BallotQuestionBrowseItem
} from "components/ballotquestions/BrowseBallotQuestions"
import { createPage } from "components/page"
import {
  collectionGroup,
  getDocs,
  query,
  where
} from "firebase/firestore"
import type { BallotQuestion } from "components/db"
import type { Testimony } from "components/db/testimony"
import { firestore } from "components/firebase"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { GetServerSideProps } from "next"

type BrowseBallotQuestionsPageProps = {
  electionYear: number
  items: BallotQuestionBrowseItem[]
}

export default createPage({
  titleI18nKey: "navigation.browseBallotQuestions",
  Page: ({ electionYear, items }: BrowseBallotQuestionsPageProps) => {
    const { t } = useTranslation("search")

    return (
      <Container fluid="xl" className="mt-3 mb-4">
        <h1>{t("browse_ballot_questions")}</h1>
        <BrowseBallotQuestions items={items} year={electionYear} />
      </Container>
    )
  }
})

export const getServerSideProps: GetServerSideProps<
  BrowseBallotQuestionsPageProps
> = async ({ locale, res }) => {
  const electionYear = new Date().getFullYear()
  const ballotQuestions = (await dbService().getBallotQuestions())
    .filter(ballotQuestion => ballotQuestion.electionYear === electionYear)
    .sort(sortBallotQuestions)

  const items = await Promise.all(
    ballotQuestions.map(async ballotQuestion => {
      const [bill, counts] = await Promise.all([
        ballotQuestion.billId
          ? dbService().getBill({
              court: ballotQuestion.court,
              billId: ballotQuestion.billId
            })
          : Promise.resolve(undefined),
        getBallotQuestionCounts(ballotQuestion.id)
      ])

      return {
        id: ballotQuestion.id,
        title:
          bill?.content.Title ??
          `Question ${ballotQuestion.ballotQuestionNumber ?? ballotQuestion.id}`,
        electionYear: ballotQuestion.electionYear,
        ...counts
      }
    })
  )

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300")

  return {
    props: {
      electionYear,
      items,
      ...(await serverSideTranslations(locale ?? "en", [
        "auth",
        "search",
        "common",
        "footer",
        "testimony"
      ]))
    }
  }
}

async function getBallotQuestionCounts(ballotQuestionId: string) {
  const snapshot = await getDocs(
    query(
      collectionGroup(firestore, "publishedTestimony"),
      where("ballotQuestionId", "==", ballotQuestionId)
    )
  )

  return snapshot.docs.reduce(
    (counts, doc) => {
      const testimony = doc.data() as Testimony
      switch (testimony.position) {
        case "endorse":
          counts.endorseCount += 1
          break
        case "neutral":
          counts.neutralCount += 1
          break
        case "oppose":
          counts.opposeCount += 1
          break
      }
      return counts
    },
    { endorseCount: 0, neutralCount: 0, opposeCount: 0 }
  )
}

function sortBallotQuestions(a: BallotQuestion, b: BallotQuestion) {
  const numberA = a.ballotQuestionNumber ?? Number.MAX_SAFE_INTEGER
  const numberB = b.ballotQuestionNumber ?? Number.MAX_SAFE_INTEGER
  if (numberA !== numberB) return numberA - numberB
  return a.id.localeCompare(b.id)
}
