import { useTranslation } from "next-i18next"
import Link from "next/link"
import styled from "styled-components"
import { Card, Image } from "../bootstrap"
import { maple } from "../links"

export type BallotQuestionBrowseItem = {
  id: string
  title: string
  electionYear: number
  endorseCount: number
  neutralCount: number
  opposeCount: number
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const StyledCard = styled(Card)`
  border: none;
  border-radius: 4px;
  overflow: hidden;
  outline-color: var(--bs-blue);
  outline-style: solid;
  outline-width: 0;
  transition: outline-width 0.1s;

  &:hover {
    outline-width: 2px;
  }

  &:active {
    outline-width: 4px;
  }

  .card-body {
    padding: 0.75rem 1rem;
  }
`

const MetaRow = styled.div`
  color: var(--bs-blue);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  justify-content: space-between;
  margin-bottom: 0.35rem;
`

const SentimentRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 1rem;
`

const SentimentStat = styled.span`
  display: inline-flex;
  align-items: center;
  color: var(--bs-blue);
  font-size: 0.8rem;
  font-weight: 600;
  gap: 0.35rem;

  img {
    width: 18px;
    height: 18px;
  }
`

const ElectionYear = styled.span`
  white-space: nowrap;
`

export const BrowseBallotQuestions = ({
  items,
  year
}: {
  items: BallotQuestionBrowseItem[]
  year: number
}) => {
  const { t } = useTranslation(["search", "testimony"])

  if (items.length === 0) {
    return (
      <p className="text-muted mb-0">
        {t("browse_ballot_questions_empty", { ns: "search", year })}
      </p>
    )
  }

  return (
    <List>
      {items.map(item => (
        <Link
          key={item.id}
          href={maple.ballotQuestion({ id: item.id })}
          className="text-decoration-none text-reset"
        >
          <StyledCard>
            <Card.Body className="bg-white">
              <MetaRow>
                <span>
                  {t("ballot_question_document_id", {
                    ns: "search",
                    id: item.id
                  })}
                </span>
                <SentimentRow>
                  <SentimentStat>
                    <Image
                      src="/thumbs-endorse.svg"
                      alt={t("counts.endorsements.alt", { ns: "testimony" })}
                    />
                    {item.endorseCount}
                  </SentimentStat>
                  <SentimentStat>
                    <Image
                      src="/thumbs-neutral.svg"
                      alt={t("counts.neutral.alt", { ns: "testimony" })}
                    />
                    {item.neutralCount}
                  </SentimentStat>
                  <SentimentStat>
                    <Image
                      src="/thumbs-oppose.svg"
                      alt={t("counts.oppose.alt", { ns: "testimony" })}
                    />
                    {item.opposeCount}
                  </SentimentStat>
                </SentimentRow>
              </MetaRow>
              <Card.Title as="h5" className="mb-2">
                {item.title}
              </Card.Title>
              <ElectionYear>
                {t("ballot_question_election_year", {
                  ns: "search",
                  year: item.electionYear
                })}
              </ElectionYear>
            </Card.Body>
          </StyledCard>
        </Link>
      ))}
    </List>
  )
}
