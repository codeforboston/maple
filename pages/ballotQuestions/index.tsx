import { dbService } from "components/db"
import { BrowseBallotQuestions } from "components/ballotquestions/BrowseBallotQuestions"
import type { BallotQuestionBrowseItem } from "components/ballotquestions/BrowseBallotQuestions"
import { createPage } from "components/page"
import { PageColumn } from "components/shared/PageColumn"
import { PageArt } from "components/shared/PageArt"
import { LearnGround } from "components/shared/LearnGround"
import { LEARN_LOOK } from "components/Navbar"
import styled from "styled-components"
import type { BallotQuestion } from "components/db"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { GetServerSideProps } from "next"
import { flags } from "components/featureFlags"

type BrowseBallotQuestionsPageProps = {
  currentYear: number
  items: BallotQuestionBrowseItem[]
}

export default createPage({
  titleI18nKey: "navigation.browseBallotQuestions",
  Page: ({ currentYear, items }: BrowseBallotQuestionsPageProps) => {
    const { t } = useTranslation("ballotquestions")

    return (
      <ArtColumn $width="xwide" className="mt-3 mb-4">
        {/* An open envelope (a mailed ballot). */}
        <PageArt
          src="/Mail with Blob.svg"
          out={1.5}
          sameSize
          size={8}
          leftLift={1}
        />
        {LEARN_LOOK.includes("/ballotQuestions") && <LearnGround />}
        <h1>{t("browse_ballot_questions")}</h1>
        <p className="text-muted mb-4 col-lg-8 px-0">
          {t("browse_ballot_questions_intro")}
        </p>
        <BrowseBallotQuestions items={items} currentYear={currentYear} />
      </ArtColumn>
    )
  }
})

/* The page art places itself against this column. */
const ArtColumn = styled(PageColumn)`
  position: relative;
`

export const getServerSideProps: GetServerSideProps<
  BrowseBallotQuestionsPageProps
> = async ({ locale, res }) => {
  if (!flags().ballotQuestions) return { notFound: true }
  const currentYear = new Date().getFullYear()
  const ballotQuestions = (await dbService().getBallotQuestions()).sort(
    sortBallotQuestions
  )

  const items = await Promise.all(
    ballotQuestions.map(async ballotQuestion => {
      const bill = ballotQuestion.billId
        ? await dbService().getBill({
            court: ballotQuestion.court,
            billId: ballotQuestion.billId
          })
        : undefined

      return {
        id: ballotQuestion.id,
        title:
          ballotQuestion.title ??
          bill?.content.Title ??
          `Question ${ballotQuestion.ballotQuestionNumber ?? "#"}`,
        fullSummary: ballotQuestion.fullSummary ?? "",
        electionYear: ballotQuestion.electionYear,
        court: ballotQuestion.court,
        ballotStatus: ballotQuestion.ballotStatus,
        ballotQuestionNumber: ballotQuestion.ballotQuestionNumber,
        endorseCount: ballotQuestion.endorseCount ?? 0,
        neutralCount: ballotQuestion.neutralCount ?? 0,
        opposeCount: ballotQuestion.opposeCount ?? 0
      }
    })
  )

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300")

  return {
    props: {
      currentYear,
      items,
      ...(await serverSideTranslations(locale ?? "en", [
        "auth",
        "ballotquestions",
        "common",
        "footer",
        "testimony"
      ]))
    }
  }
}

function sortBallotQuestions(a: BallotQuestion, b: BallotQuestion) {
  if (a.electionYear !== b.electionYear) {
    return b.electionYear - a.electionYear
  }
  if (a.court !== b.court) {
    return b.court - a.court
  }
  const numberA = a.ballotQuestionNumber ?? Number.MAX_SAFE_INTEGER
  const numberB = b.ballotQuestionNumber ?? Number.MAX_SAFE_INTEGER
  if (numberA !== numberB) return numberA - numberB
  return a.id.localeCompare(b.id)
}
