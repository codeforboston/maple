import Link from "next/link"
import { useRouter } from "next/router"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Card, Badge } from "../../bootstrap"
import { Highlight } from "react-instantsearch"
import { HearingHitData } from "./HearingSearch"
import {
  useState,
  useMemo,
  KeyboardEvent,
  MouseEvent,
  useCallback
} from "react"

const StyledCard = styled(Card)`
  border: none;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  outline-color: var(--bs-blue);
  outline-style: solid;
  outline-width: 0;
  transition: outline-width 0.1s;

  font-size: 0.85rem;

  &:hover {
    outline-width: 2px;
  }

  &:active {
    outline-width: 4px;
  }

  .card-body {
    padding: 0.85rem 1rem;
  }
`

const SectionLabel = styled.span`
  color: var(--bs-blue);
  font-weight: 600;
  margin-right: 0.5rem;
`

export const HearingHit = ({ hit }: { hit: HearingHitData }) => {
  const { t } = useTranslation(["search", "hearing"])
  const router = useRouter()
  const startsAt = new Date(hit.startsAt)
  const scheduleDate = t("schedule_date", { ns: "hearing", date: startsAt })
  const scheduleTime = t("schedule_time", { ns: "hearing", date: startsAt })
  const committeeChairs = hit.committeeChairs
  const topics = hit.agendaTopics
  const bills = useMemo(() => {
    const numbers = hit.billNumbers ?? []
    const slugs = hit.billSlugs ?? []
    return numbers.map((number, index) => ({
      number,
      slug: slugs[index]!
    }))
  }, [hit.billNumbers, hit.billSlugs])

  const navigateToHearing = useCallback(() => {
    void router.push(`/hearing/${hit.eventId}`)
  }, [hit.eventId, router])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      navigateToHearing()
    }
  }

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    navigateToHearing()
  }

  return (
    <StyledCard
      role="link"
      tabIndex={0}
      className="w-100"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={hit.title}
    >
      <Card.Body className="bg-white">
        <div className="d-flex flex-column gap-2">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
            <div className="d-flex flex-column">
              <span className="text-uppercase fw-semibold text-secondary">
                {scheduleDate}
              </span>
              <span className="text-secondary">{scheduleTime}</span>
            </div>
            {hit.hasVideo ? (
              <Badge bg="success" pill>
                {t("video_available", { ns: "search" })}
              </Badge>
            ) : null}
          </div>

          <div>
            <Card.Title as="h6" className="mb-1">
              <Highlight attribute="title" hit={hit} />
            </Card.Title>
            {hit.description ? (
              <p className="mb-0 text-muted">
                <Highlight attribute="description" hit={hit} />
              </p>
            ) : null}
          </div>

          {hit.locationName || hit.locationCity ? (
            <div>
              <SectionLabel>
                {t("location_label", { ns: "search" })}
              </SectionLabel>
              <span>
                {hit.locationName ?? hit.locationCity}
                {hit.locationName && hit.locationCity
                  ? ` · ${hit.locationCity}`
                  : ""}
              </span>
            </div>
          ) : null}

          {committeeChairs.length ? (
            <div className="d-flex align-items-center gap-2">
              <SectionLabel>{t("chairs", { ns: "hearing" })}</SectionLabel>
              {<span>{committeeChairs.join(", ")}</span>}
            </div>
          ) : null}

          {topics.length ? (
            <div>
              <SectionLabel>{t("agenda_label", { ns: "search" })}</SectionLabel>
              <span>{topics.join(", ")}</span>
            </div>
          ) : null}

          <BillsSection bills={bills} />
        </div>
      </Card.Body>
    </StyledCard>
  )
}

const BillsSection = ({
  bills
}: {
  bills: { number: string; slug: string }[]
}) => {
  const { t } = useTranslation("search")
  const [showAllBills, setShowAllBills] = useState(false)

  if (!bills.length) return null

  const visibleCount = showAllBills ? bills.length : Math.min(7, bills.length)
  const visibleBills = bills.slice(0, visibleCount)
  const remaining = bills.length - visibleCount

  return (
    <div>
      <SectionLabel>{t("bills_label")}</SectionLabel>
      <span>
        {visibleBills.map((bill, index) => {
          const isLastVisible = index === visibleBills.length - 1
          const shouldShowComma =
            !isLastVisible || (!showAllBills && remaining > 0)

          return (
            <span key={`${bill.slug}-${bill.number}-${index}`}>
              <Link href={`/bills/${bill.slug}`} legacyBehavior>
                <a
                  className="text-decoration-none"
                  onClick={event => event.stopPropagation()}
                  onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.stopPropagation()
                    }
                  }}
                >
                  {bill.number}
                </a>
              </Link>
              {shouldShowComma ? ", " : ""}
            </span>
          )
        })}
        {!showAllBills && remaining > 0 ? (
          <button
            type="button"
            className="btn btn-link p-0 align-baseline"
            onClick={event => {
              event.stopPropagation()
              setShowAllBills(true)
            }}
          >
            {t("more_bills", { count: remaining })}
          </button>
        ) : null}
      </span>
    </div>
  )
}
