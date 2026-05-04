import { Alert, Button, Card, Form, Image } from "components/bootstrap"
import { useTranslation } from "next-i18next"
import Link from "next/link"
import { useDeferredValue, useState } from "react"
import styled from "styled-components"
import type { BallotQuestion } from "../db"
import { maple } from "../links"
import { QuestionTooltip } from "../tooltip"
import { SearchContainer } from "../search/SearchContainer"

type BallotQuestionStatus = BallotQuestion["ballotStatus"]

export type BallotQuestionBrowseItem = {
  id: string
  title: string
  fullSummary: string
  electionYear: number
  court: number
  ballotStatus: BallotQuestionStatus
  ballotQuestionNumber: number | null
  endorseCount: number
  neutralCount: number
  opposeCount: number
}

const STATUS_STYLES: Record<
  BallotQuestionStatus,
  { background: string; color: string; border: string }
> = {
  expectedOnBallot: {
    background: "var(--maple-status-expectedonballot-bg)",
    color: "var(--maple-status-expectedonballot-text)",
    border: "var(--maple-status-expectedonballot-border)"
  },
  accepted: {
    background: "var(--maple-status-accepted-bg)",
    color: "var(--maple-status-accepted-text)",
    border: "var(--maple-status-accepted-border)"
  },
  rejected: {
    background: "var(--maple-status-rejected-bg)",
    color: "var(--maple-status-rejected-text)",
    border: "var(--maple-status-rejected-border)"
  },
  failedToAppear: {
    background: "var(--maple-status-failedtoappear-bg)",
    color: "var(--maple-status-failedtoappear-text)",
    border: "var(--maple-status-failedtoappear-border)"
  }
}

const Controls = styled.section`
  background: var(--maple-surface-gradient);
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--bs-border-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  transition: all 0.3s ease;
`

const ControlsHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: var(--maple-space-md);

  @media (max-width: 576px) {
    align-items: stretch;
    flex-direction: column;
  }
`

const ControlsToolbar = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  width: 100%;

  @media (max-width: 992px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const SearchColumn = styled.div`
  flex: 1 1 0;
  min-width: 0;
`

const FilterColumn = styled.div`
  display: grid;
  gap: 0.75rem;
  flex: 1 1 0;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  min-width: 0;

  @media (max-width: 992px) {
    grid-template-columns: 1fr 1fr;
    flex: none;
    width: 100%;
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`

const SummaryRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;

  @media (max-width: 576px) {
    align-items: stretch;
    flex-direction: column;
  }
`

const ControlsButton = styled(Button)`
  flex: 0 0 auto;
  padding: var(--maple-space-xs) var(--maple-space-sm);
  font-size: 0.9rem;
  white-space: nowrap;
  width: fit-content;

  &:focus-visible {
    outline: 2px solid var(--maple-focus-ring);
    outline-offset: 2px;
  }
`

const SearchBoxShell = styled.div`
  flex: 1 1 0;
  min-width: 0;

  .ais-SearchBox-form {
    width: 100%;
  }

  .ais-SearchBox-input {
    width: 100%;
  }
`

const ControlsGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  width: 100%;
`

const FilterLabel = styled(Form.Label)`
  color: var(--bs-gray-700);
  font-size: 0.82rem;
  font-weight: var(--maple-font-weight-bold);
  margin-bottom: var(--maple-space-xs);
`

const ResultsSummary = styled.p.attrs({
  role: "status",
  "aria-live": "polite"
})`
  color: var(--bs-gray-600);
  font-size: 0.95rem;
  font-weight: var(--maple-font-weight-semibold);
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
  background: var(--maple-surface-gradient);
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--bs-border-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  height: 100%;
  overflow: hidden;
  transition: transform 0.16s ease, box-shadow 0.16s ease,
    border-color 0.16s ease;

  .card-body {
    display: flex;
    flex-direction: column;
    gap: var(--maple-space-md);
    height: 100%;
    border-radius: var(--bs-border-radius-xl);
    padding: var(--maple-space-md) var(--maple-space-lg);
  }
`

const CardLink = styled(Link)`
  color: inherit;
  display: block;
  height: 100%;
  text-decoration: none;

  &:hover ${StyledCard} {
    border-color: var(--maple-border-accent-strong);
    box-shadow: var(--maple-shadow-hover);
    transform: translateY(-2px);
  }

  &:focus-visible {
    border-radius: 1rem;
    outline: 3px solid var(--maple-focus-ring);
    outline-offset: 4px;
  }
`

const TopRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
`

const StatusBadge = styled.span<{ $status: BallotQuestionStatus }>`
  background: ${({ $status }) => STATUS_STYLES[$status].background};
  border: 1px solid ${({ $status }) => STATUS_STYLES[$status].border};
  border-radius: 999px;
  color: ${({ $status }) => STATUS_STYLES[$status].color};
  display: inline-flex;
  font-size: 0.74rem;
  font-weight: var(--maple-font-weight-bold);
  letter-spacing: 0.02em;
  line-height: var(--maple-line-height-tight);
  padding: var(--maple-space-xs) var(--maple-space-sm);
  white-space: nowrap;
`

const DocumentId = styled.span`
  color: var(--bs-gray-600);
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

const QuestionNumber = styled.h2`
  color: var(--bs-dark-blue);
  font-size: 1.3rem;
  font-weight: var(--maple-font-weight-bold);
  line-height: var(--maple-line-height-tight);
  margin: 0;
`

const QuestionTitle = styled.p`
  color: var(--bs-gray-700);
  font-size: 0.95rem;
  font-weight: var(--maple-font-weight-bold);
  line-height: 1.4;
  margin: 0;
`

const Summary = styled.p`
  color: var(--bs-gray-700);
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
  background: var(--maple-surface-base);
  border: 1px solid var(--maple-surface-border);
  border-radius: 999px;
  color: var(--bs-gray-700);
  font-size: 0.8rem;
  font-weight: var(--maple-font-weight-semibold);
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
  background: var(--maple-surface-base);
  border: 1px solid var(--maple-surface-border);
  border-radius: 999px;
  color: var(--bs-blue);
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
  background: var(--maple-surface-gradient);
  border: 1px solid var(--maple-surface-border);
  border-radius: 1rem;
  box-shadow: var(--maple-shadow-sm);
  color: var(--bs-gray-700);
  padding: 1rem;
`

export const BrowseBallotQuestions = ({
  items,
  currentYear
}: {
  items: BallotQuestionBrowseItem[]
  currentYear: number
}) => {
  const { t } = useTranslation(["ballotquestions", "testimony"])
  const getStatusLabel = (status: BallotQuestionStatus) =>
    t(`ballot_question_status.${status}`)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState(String(currentYear))
  const [selectedCourt, setSelectedCourt] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showInfo, setShowInfo] = useState(true)
  const deferredQuery = useDeferredValue(searchQuery.trim().toLowerCase())

  if (items.length === 0) {
    return (
      <p className="text-muted mb-0">
        {t("browse_ballot_questions_empty", {
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
  const questionNumberDisclaimer = t("header.questionNumberDisclaimer")

  return (
    <>
      {showInfo && (
        <Alert
          variant="info"
          dismissible
          onClose={() => setShowInfo(false)}
          className="maple-info-alert mb-3 rounded-4"
        >
          {questionNumberDisclaimer}
        </Alert>
      )}

      <SearchContainer>
        <Controls aria-label={t("browse.filtersAriaLabel")}>
          <ControlsToolbar>
            <SearchBoxShell className="ais-SearchBox">
              <div className="ais-SearchBox-form">
                <Form.Control
                  id="ballot-question-search"
                  type="search"
                  value={searchQuery}
                  className="ais-SearchBox-input"
                  aria-label={t("ballot_question_search_label")}
                  placeholder={t("ballot_question_search_placeholder")}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </SearchBoxShell>

            <FilterColumn>
              <div>
                <FilterLabel htmlFor="ballot-question-year">
                  {t("ballot_question_filter_year")}
                </FilterLabel>
                <Form.Select
                  id="ballot-question-year"
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                >
                  <option value="all">{t("ballot_question_all_years")}</option>
                  {yearOptions.map(optionYear => (
                    <option key={optionYear} value={optionYear}>
                      {optionYear}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div>
                <FilterLabel htmlFor="ballot-question-court">
                  {t("ballot_question_filter_court")}
                </FilterLabel>
                <Form.Select
                  id="ballot-question-court"
                  value={selectedCourt}
                  onChange={e => setSelectedCourt(e.target.value)}
                >
                  <option value="all">{t("ballot_question_all_courts")}</option>
                  {courtOptions.map(court => (
                    <option key={court} value={court}>
                      {t("ballot_question_court", { court })}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div>
                <FilterLabel htmlFor="ballot-question-status">
                  {t("ballot_question_filter_status")}
                </FilterLabel>
                <Form.Select
                  id="ballot-question-status"
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                >
                  <option value="all">
                    {t("ballot_question_all_statuses")}
                  </option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </FilterColumn>
          </ControlsToolbar>

          <SummaryRow>
            <ResultsSummary>
              {t("ballot_question_results_summary", {
                count: filteredItems.length,
                total: items.length
              })}
            </ResultsSummary>

            {hasActiveFilters ? (
              <ControlsButton
                variant="outline-secondary"
                size="sm"
                onClick={resetFilters}
              >
                {t("ballot_question_reset_filters")}
              </ControlsButton>
            ) : null}
          </SummaryRow>
        </Controls>

        {filteredItems.length === 0 ? (
          <EmptyState>{t("ballot_question_no_results")}</EmptyState>
        ) : (
          <List>
            {filteredItems.map(item => (
              <ListItem key={item.id}>
                <CardLink
                  href={maple.ballotQuestion({ id: item.id })}
                  aria-label={`${item.title} (${getStatusLabel(
                    item.ballotStatus
                  )})`}
                >
                  <StyledCard>
                    <Card.Body>
                      <TopRow>
                        <StatusBadge $status={item.ballotStatus}>
                          {getStatusLabel(item.ballotStatus)}
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
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                          }}
                        >
                          <QuestionNumber>
                            {item.ballotQuestionNumber != null ? (
                              t("browse.questionWithNumber", {
                                count: item.ballotQuestionNumber
                              })
                            ) : (
                              <>
                                {t("browse.questionUnassigned")}
                                <QuestionTooltip
                                  text={questionNumberDisclaimer}
                                />
                              </>
                            )}
                          </QuestionNumber>
                        </div>
                        <QuestionTitle>{item.title}</QuestionTitle>
                      </TitleBlock>
                      <Summary>
                        {item.fullSummary || t("ballot_question_no_summary")}
                      </Summary>
                    </Card.Body>
                  </StyledCard>
                </CardLink>
              </ListItem>
            ))}
          </List>
        )}
      </SearchContainer>
    </>
  )
}
