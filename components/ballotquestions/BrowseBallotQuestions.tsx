import { Alert, Button, Card, Form, Image } from "components/bootstrap"
import { useTranslation } from "next-i18next"
import Link from "next/link"
import { useDeferredValue, useState } from "react"
import styled from "styled-components"
import type { BallotQuestion } from "../db"
import { maple } from "../links"
import { QuestionTooltip } from "../tooltip"

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

const BROWSE_SHADOWS = {
  soft: "0 0.25rem 1rem rgba(15, 23, 42, 0.06)",
  card: "0 0.3rem 1rem rgba(15, 23, 42, 0.06)",
  hover: "0 0.65rem 1.35rem rgba(15, 23, 42, 0.12)"
}

const BROWSE_BORDERS = {
  chrome: "#d9e2ec",
  muted: "#dce5ee",
  hover: "#bfd0e2"
}

const STATUS_STYLES: Record<
  BallotQuestionStatus,
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

const Controls = styled.section<{ $expanded: boolean }>`
  background: linear-gradient(
    180deg,
    var(--bs-white) 0%,
    var(--bs-body-bg) 100%
  );
  border: 1px solid ${BROWSE_BORDERS.chrome};
  border-radius: var(--bs-border-radius-xl);
  box-shadow: ${BROWSE_SHADOWS.soft};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${props => (props.$expanded ? "0.75rem" : "0")};
  margin-bottom: 1.5rem;
  padding: 1rem;
  transition: all 0.3s ease;
`

const ControlsHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 0.75rem;

  @media (max-width: 576px) {
    align-items: stretch;
    flex-direction: column;
  }
`

const ControlsSummary = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`

const ControlsActions = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-left: auto;
  flex-wrap: nowrap;

  @media (max-width: 576px) {
    margin-left: 0;
    width: 100%;
  }
`

const ControlsButton = styled(Button)`
  flex: 0 0 auto;
  padding: 0.375rem 0.5rem;
  font-size: 0.9rem;
  white-space: nowrap;
  width: fit-content;

  &:focus-visible {
    outline: 2px solid var(--bs-blue);
    outline-offset: 2px;
  }
`

const ControlsGrid = styled.div<{ $expanded: boolean }>`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(0, 2.4fr) repeat(3, minmax(0, 1fr));
  width: 100%;
  max-height: ${props => (props.$expanded ? "500px" : "0")};
  overflow: clip;
  transform: translateY(${props => (props.$expanded ? "0" : "-10px")});
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out;
  opacity: ${props => (props.$expanded ? 1 : 0)};

  @media (max-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`

const FilterLabel = styled(Form.Label)`
  color: var(--bs-gray-700);
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
`

const ResultsSummary = styled.p.attrs({
  role: "status",
  "aria-live": "polite"
})`
  color: var(--bs-gray-600);
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
  background: linear-gradient(
    180deg,
    var(--bs-white) 0%,
    var(--bs-body-bg) 100%
  );
  border: 1px solid ${BROWSE_BORDERS.chrome};
  border-radius: var(--bs-border-radius-xl);
  box-shadow: ${BROWSE_SHADOWS.card};
  height: 100%;
  overflow: hidden;
  transition: transform 0.16s ease, box-shadow 0.16s ease,
    border-color 0.16s ease;

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    height: 100%;
    border-radius: var(--bs-border-radius-xl);
    padding: 0.8rem 0.9rem;
  }
`

const CardLink = styled(Link)`
  color: inherit;
  display: block;
  height: 100%;
  text-decoration: none;

  &:hover ${StyledCard} {
    border-color: ${BROWSE_BORDERS.hover};
    box-shadow: ${BROWSE_SHADOWS.hover};
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

const StatusBadge = styled.span<{ $status: BallotQuestionStatus }>`
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
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
`

const QuestionTitle = styled.p`
  color: var(--bs-gray-700);
  font-size: 0.95rem;
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
  background: var(--bs-body-bg);
  border: 1px solid ${BROWSE_BORDERS.muted};
  border-radius: 999px;
  color: var(--bs-gray-700);
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
  background: var(--bs-body-bg);
  border: 1px solid ${BROWSE_BORDERS.muted};
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
  background: linear-gradient(
    180deg,
    var(--bs-white) 0%,
    var(--bs-body-bg) 100%
  );
  border: 1px solid ${BROWSE_BORDERS.chrome};
  border-radius: 1rem;
  box-shadow: ${BROWSE_SHADOWS.soft};
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
  const { t } = useTranslation(["search", "testimony"])
  const getStatusLabel = (status: BallotQuestionStatus) =>
    t(`ballot_question_status.${status}`, { ns: "search" })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState(String(currentYear))
  const [selectedCourt, setSelectedCourt] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
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
      {showInfo && (
        <Alert
          variant="info"
          dismissible
          onClose={() => setShowInfo(false)}
          className="mb-3 rounded-4 ballot-question-info-alert"
        >
          The exact question number will be assigned this summer by the
          Secretary of State
        </Alert>
      )}

      <Controls $expanded={searchExpanded} aria-label="Filter ballot questions">
        <ControlsGrid
          id="ballot-question-filters"
          $expanded={searchExpanded}
          aria-hidden={!searchExpanded}
        >
          <div>
            <FilterLabel htmlFor="ballot-question-search">
              {t("ballot_question_search_label", { ns: "search" })}
            </FilterLabel>
            <Form.Control
              id="ballot-question-search"
              type="search"
              value={searchQuery}
              disabled={!searchExpanded}
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
              disabled={!searchExpanded}
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
              disabled={!searchExpanded}
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
              disabled={!searchExpanded}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="all">
                {t("ballot_question_all_statuses", { ns: "search" })}
              </option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </Form.Select>
          </div>
        </ControlsGrid>

        <ControlsHeader>
          <ControlsSummary>
            <ResultsSummary>
              {t("ballot_question_results_summary", {
                ns: "search",
                count: filteredItems.length,
                total: items.length
              })}
            </ResultsSummary>
          </ControlsSummary>

          <ControlsActions>
            {hasActiveFilters ? (
              <ControlsButton
                variant="outline-secondary"
                size="sm"
                onClick={resetFilters}
              >
                {t("ballot_question_reset_filters", { ns: "search" })}
              </ControlsButton>
            ) : null}
            <ControlsButton
              variant="outline-secondary"
              size="sm"
              onClick={() => setSearchExpanded(!searchExpanded)}
              aria-controls="ballot-question-filters"
              aria-expanded={searchExpanded}
            >
              {searchExpanded ? "Hide filters" : "Show filters"}
            </ControlsButton>
          </ControlsActions>
        </ControlsHeader>
      </Controls>

      {filteredItems.length === 0 ? (
        <EmptyState>
          {t("ballot_question_no_results", { ns: "search" })}
        </EmptyState>
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
                          Question{" "}
                          {item.ballotQuestionNumber ? (
                            item.ballotQuestionNumber
                          ) : (
                            <>
                              #
                              <QuestionTooltip text="The exact question number will be assigned this summer by the Secretary of State" />
                            </>
                          )}
                        </QuestionNumber>
                      </div>
                      <QuestionTitle>{item.title}</QuestionTitle>
                    </TitleBlock>
                  </Card.Body>
                </StyledCard>
              </CardLink>
            </ListItem>
          ))}
        </List>
      )}
    </>
  )
}
