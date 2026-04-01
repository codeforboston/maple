import { Button, Card, Form, Image } from "components/bootstrap"
import { useTranslation } from "next-i18next"
import Link from "next/link"
import { useDeferredValue, useState } from "react"
import styled from "styled-components"
import type { BallotQuestion } from "../db"
import { maple } from "../links"

export type BallotQuestionBrowseItem = {
  id: string
  title: string
  fullSummary: string
  electionYear: number
  court: number
  ballotStatus: BallotQuestion["ballotStatus"]
  ballotQuestionNumber: number | null
  endorseCount: number
  neutralCount: number
  opposeCount: number
}

const STATUS_LABELS: Record<BallotQuestion["ballotStatus"], string> = {
  legislature: "Legislature",
  qualifying: "Qualifying",
  certified: "Certified",
  ballot: "On Ballot",
  enacted: "Enacted",
  failed: "Failed",
  withdrawn: "Withdrawn"
}

const STATUS_STYLES: Record<
  BallotQuestion["ballotStatus"],
  { background: string; color: string; border: string }
> = {
  legislature: {
    background: "#e8efff",
    color: "#1d3f8a",
    border: "#c9d8ff"
  },
  qualifying: {
    background: "#fff3d9",
    color: "#865300",
    border: "#f5d78a"
  },
  certified: {
    background: "#e6f6ee",
    color: "#0b6a42",
    border: "#bae6d0"
  },
  ballot: {
    background: "#fde8ef",
    color: "#902141",
    border: "#f4bfd0"
  },
  enacted: {
    background: "#e8f6ea",
    color: "#1d5d2d",
    border: "#c8e7cf"
  },
  failed: {
    background: "#f1f5f9",
    color: "#475569",
    border: "#d7e0ea"
  },
  withdrawn: {
    background: "#fff0e0",
    color: "#92400e",
    border: "#f5d0a7"
  }
}

const Controls = styled.section`
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #d9e2ec;
  border-radius: 1rem;
  box-shadow: 0 0.25rem 1rem rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
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

const FilterLabel = styled(Form.Label)`
  color: #334155;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
`

const ResultsBar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: space-between;
`

const ResultsSummary = styled.p.attrs({
  role: "status",
  "aria-live": "polite"
})`
  color: #475569;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
`

const List = styled.div.attrs({ role: "list" })`
  display: grid;
  gap: 1.15rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const ListItem = styled.div.attrs({ role: "listitem" })`
  min-width: 0;
`

const StyledCard = styled(Card)`
  background: linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%);
  border: 1px solid #d9e2ec;
  border-radius: 1rem;
  box-shadow: 0 0.3rem 1rem rgba(15, 23, 42, 0.06);
  height: 100%;
  overflow: hidden;
  transition: transform 0.16s ease, box-shadow 0.16s ease,
    border-color 0.16s ease;

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    padding: 1.1rem 1.15rem 1rem;
  }
`

const CardLink = styled.a`
  color: inherit;
  display: block;
  height: 100%;
  text-decoration: none;

  &:hover ${StyledCard} {
    border-color: #bfd0e2;
    box-shadow: 0 0.65rem 1.35rem rgba(15, 23, 42, 0.12);
    transform: translateY(-2px);
  }

  &:focus-visible {
    border-radius: 1rem;
    outline: 3px solid var(--bs-blue);
    outline-offset: 4px;
  }
`

const TopRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
`

const StatusBadge = styled.span<{ $status: BallotQuestion["ballotStatus"] }>`
  background: ${({ $status }) => STATUS_STYLES[$status].background};
  border: 1px solid ${({ $status }) => STATUS_STYLES[$status].border};
  border-radius: 999px;
  color: ${({ $status }) => STATUS_STYLES[$status].color};
  display: inline-flex;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  padding: 0.4rem 0.62rem;
  white-space: nowrap;
`

const DocumentId = styled.span`
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
`

const TitleBlock = styled.div`
  display: grid;
  gap: 0.45rem;
`

const QuestionEyebrow = styled.span`
  color: #334155;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`

const QuestionTitle = styled(Card.Title)`
  color: #102a43;
  font-size: 1.24rem;
  line-height: 1.34;
  margin: 0;
`

const Summary = styled.p`
  color: #52606d;
  display: -webkit-box;
  font-size: 0.98rem;
  line-height: 1.66;
  margin: 0;
  min-height: 6.9rem;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
`

const MetaStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
`

const MetaItem = styled.span`
  background: #f5f8fb;
  border: 1px solid #dce5ee;
  border-radius: 999px;
  color: #486581;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.24rem 0.55rem;
`

const FooterRow = styled.div`
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.1rem;
`

const SentimentRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const SentimentStat = styled.span`
  align-items: center;
  background: #f7f9fc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #284b7a;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 700;
  gap: 0.35rem;
  padding: 0.32rem 0.55rem;

  img {
    height: 16px;
    width: 16px;
  }
`

const EmptyState = styled.div`
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #d9e2ec;
  border-radius: 1rem;
  box-shadow: 0 0.25rem 1rem rgba(15, 23, 42, 0.06);
  color: #52606d;
  padding: 1rem;
`

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

  const hasActiveFilters =
    searchQuery.length > 0 ||
    selectedYear !== String(currentYear) ||
    selectedCourt !== "all" ||
    selectedStatus !== "all"

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedYear(String(currentYear))
    setSelectedCourt("all")
    setSelectedStatus("all")
  }

  return (
    <>
      <Controls aria-label="Filter ballot questions">
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

        <ResultsBar>
          <ResultsSummary>
            {t("ballot_question_results_summary", {
              ns: "search",
              count: filteredItems.length,
              total: items.length
            })}
          </ResultsSummary>

          {hasActiveFilters ? (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={resetFilters}
            >
              {t("ballot_question_reset_filters", { ns: "search" })}
            </Button>
          ) : null}
        </ResultsBar>
      </Controls>

      {filteredItems.length === 0 ? (
        <EmptyState>
          {t("ballot_question_no_results", { ns: "search" })}
        </EmptyState>
      ) : (
        <List>
          {filteredItems.map(item => (
            <ListItem key={item.id}>
              <Link href={maple.ballotQuestion({ id: item.id })} legacyBehavior>
                <CardLink
                  aria-label={`${item.title} (${
                    STATUS_LABELS[item.ballotStatus]
                  })`}
                >
                  <StyledCard>
                    <Card.Body>
                      <TopRow>
                        <StatusBadge $status={item.ballotStatus}>
                          {STATUS_LABELS[item.ballotStatus]}
                        </StatusBadge>
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
                      </TopRow>

                      <TitleBlock>
                        {item.ballotQuestionNumber ? (
                          <QuestionEyebrow>
                            {t("ballot_question_number", {
                              ns: "search",
                              number: item.ballotQuestionNumber
                            })}
                          </QuestionEyebrow>
                        ) : null}
                        <QuestionTitle as="h2">{item.title}</QuestionTitle>
                      </TitleBlock>

                      <Summary>
                        {item.fullSummary ||
                          t("ballot_question_no_summary", { ns: "search" })}
                      </Summary>

                      <MetaStack>
                        <MetaItem>
                          {t("ballot_question_election_year", {
                            ns: "search",
                            year: item.electionYear
                          })}
                        </MetaItem>
                        <MetaItem>
                          {t("ballot_question_court", {
                            ns: "search",
                            court: item.court
                          })}
                        </MetaItem>
                      </MetaStack>

                      <FooterRow>
                        <DocumentId>
                          {t("ballot_question_document_id", {
                            ns: "search",
                            id: item.id
                          })}
                        </DocumentId>
                      </FooterRow>
                    </Card.Body>
                  </StyledCard>
                </CardLink>
              </Link>
            </ListItem>
          ))}
        </List>
      )}
    </>
  )
}
