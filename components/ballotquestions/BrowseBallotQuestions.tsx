import { Form } from "components/bootstrap"
import { useTranslation } from "next-i18next"
import Link from "next/link"
import { useDeferredValue, useState } from "react"
import styled from "styled-components"
import { Card, Image } from "../bootstrap"
import { maple } from "../links"
import type { BallotQuestion } from "../db"

export type BallotQuestionBrowseItem = {
  id: string
  title: string
  fullSummary: string
  electionYear: number
  court: number
  ballotStatus: BallotQuestion["ballotStatus"]
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

const Controls = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.75rem;
  box-shadow: 0 0.125rem 0.5rem rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 0.9rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
`

const ControlsGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(0, 2.4fr) repeat(3, minmax(0, 1fr));

  @media (max-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`

const MetaStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.65rem;
  margin-top: 0.35rem;
`

const MetaItem = styled.span`
  color: #6c757d;
  font-size: 0.82rem;
`

const EmptyState = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.75rem;
  box-shadow: 0 0.125rem 0.5rem rgba(15, 23, 42, 0.06);
  color: #6c757d;
  padding: 1rem;
`

const FilterLabel = styled(Form.Label)`
  color: #495057;
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
`

const STATUS_LABELS: Record<BallotQuestion["ballotStatus"], string> = {
  legislature: "Legislature",
  qualifying: "Qualifying",
  certified: "Certified",
  ballot: "On Ballot",
  enacted: "Enacted",
  failed: "Failed",
  withdrawn: "Withdrawn"
}

export const BrowseBallotQuestions = ({
  items,
  currentYear
}: {
  items: BallotQuestionBrowseItem[]
  currentYear: number
}) => {
  const { t } = useTranslation(["search", "testimony"])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState(String(currentYear))
  const [selectedCourt, setSelectedCourt] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const deferredQuery = useDeferredValue(searchQuery.trim().toLowerCase())

  if (items.length === 0) {
    return (
      <p className="text-muted mb-0">
        {t("browse_ballot_questions_empty", {
          ns: "search",
          year: currentYear
        })}
      </p>
    )
  }

  const yearOptions = Array.from(
    new Set([...items.map(item => item.electionYear), currentYear])
  ).sort((a, b) => b - a)
  const courtOptions = Array.from(new Set(items.map(item => item.court))).sort(
    (a, b) => b - a
  )
  const statusOptions = Array.from(
    new Set(items.map(item => item.ballotStatus))
  )

  const filteredItems = items.filter(item => {
    const matchesYear =
      selectedYear === "all" || item.electionYear === Number(selectedYear)
    const matchesCourt =
      selectedCourt === "all" || item.court === Number(selectedCourt)
    const matchesStatus =
      selectedStatus === "all" || item.ballotStatus === selectedStatus
    const matchesSearch =
      deferredQuery.length === 0 ||
      item.title.toLowerCase().includes(deferredQuery) ||
      item.fullSummary.toLowerCase().includes(deferredQuery)

    return matchesYear && matchesCourt && matchesStatus && matchesSearch
  })

  return (
    <>
      <Controls>
        <ControlsGrid>
          <div>
            <FilterLabel htmlFor="ballot-question-search">
              {t("ballot_question_search_label", { ns: "search" })}
            </FilterLabel>
            <Form.Control
              id="ballot-question-search"
              type="search"
              value={searchQuery}
              placeholder={t("ballot_question_search_placeholder", {
                ns: "search"
              })}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <FilterLabel htmlFor="ballot-question-year">
              {t("ballot_question_filter_year", { ns: "search" })}
            </FilterLabel>
            <Form.Select
              id="ballot-question-year"
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
            >
              <option value="all">
                {t("ballot_question_all_years", { ns: "search" })}
              </option>
              {yearOptions.map(optionYear => (
                <option key={optionYear} value={optionYear}>
                  {optionYear}
                </option>
              ))}
            </Form.Select>
          </div>

          <div>
            <FilterLabel htmlFor="ballot-question-court">
              {t("ballot_question_filter_court", { ns: "search" })}
            </FilterLabel>
            <Form.Select
              id="ballot-question-court"
              value={selectedCourt}
              onChange={e => setSelectedCourt(e.target.value)}
            >
              <option value="all">
                {t("ballot_question_all_courts", { ns: "search" })}
              </option>
              {courtOptions.map(court => (
                <option key={court} value={court}>
                  {t("ballot_question_court", { ns: "search", court })}
                </option>
              ))}
            </Form.Select>
          </div>

          <div>
            <FilterLabel htmlFor="ballot-question-status">
              {t("ballot_question_filter_status", { ns: "search" })}
            </FilterLabel>
            <Form.Select
              id="ballot-question-status"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="all">
                {t("ballot_question_all_statuses", { ns: "search" })}
              </option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Form.Select>
          </div>
        </ControlsGrid>
      </Controls>

      {filteredItems.length === 0 ? (
        <EmptyState>
          {t("ballot_question_no_results", { ns: "search" })}
        </EmptyState>
      ) : (
        <List>
          {filteredItems.map(item => (
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
                          alt={t("counts.endorsements.alt", {
                            ns: "testimony"
                          })}
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
                  <MetaStack>
                    <ElectionYear>
                      {t("ballot_question_election_year", {
                        ns: "search",
                        year: item.electionYear
                      })}
                    </ElectionYear>
                    <MetaItem>
                      {t("ballot_question_court", {
                        ns: "search",
                        court: item.court
                      })}
                    </MetaItem>
                    <MetaItem>{STATUS_LABELS[item.ballotStatus]}</MetaItem>
                  </MetaStack>
                </Card.Body>
              </StyledCard>
            </Link>
          ))}
        </List>
      )}
    </>
  )
}
