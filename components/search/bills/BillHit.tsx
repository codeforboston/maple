import { Highlight } from "react-instantsearch"
import {
  faCheckCircle,
  faMinusCircle,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { maple } from "components/links"
import { fromUnixTime } from "date-fns"
import { Hit } from "instantsearch.js"
import Link from "next/link"
import styled from "styled-components"
import { Card, Col } from "../../bootstrap"
import { formatBillId } from "../../formatting"
import { Timestamp } from "firebase/firestore"
import { dateInFuture } from "components/db/events"
import { useTranslation } from "next-i18next"

type BillRecord = {
  number: string
  title: string
  city?: string
  court: number
  currentCommittee?: string
  testimonyCount: number
  endorseCount: number
  opposeCount: number
  neutralCount: number
  nextHearingAt?: number
  latestTestimonyAt?: number
  cosponsors: string[]
  cosponsorCount: number
  primarySponsor?: string
}

const StyledCard = styled(Card)`
  background: var(--maple-surface-gradient);
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--bs-border-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  font-size: 0.75rem;
  transition: transform var(--maple-transition-fast),
    box-shadow var(--maple-transition-fast),
    border-color var(--maple-transition-fast);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--maple-shadow-hover);
    border-color: var(--maple-border-accent);
  }

  &:active {
    transform: translateY(0);
  }

  .card-body {
    padding: var(--maple-space-md) var(--maple-space-lg);
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .card-title {
    margin-bottom: 0;
  }

  .blurb {
    color: var(--bs-blue);
  }

  .endorse {
    color: var(--bs-green);
  }
  .neutral {
    color: var(--bs-blue);
  }
  .oppose {
    color: var(--bs-orange);
  }

  .testimonyCount {
    display: flex;
    align-items: center;

    svg {
      margin-left: 0.3rem;
      margin-right: 0.2rem;
    }
  }

  .left {
    padding: 0;
  }

  .card-footer {
    background-color: var(--bs-blue);
    color: white;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
`

const TestimonyCount = ({ hit }: { hit: Hit<BillRecord> }) => {
  return (
    <div className="testimonyCount">
      <FontAwesomeIcon className="endorse" icon={faCheckCircle} />
      {hit.endorseCount}
      <FontAwesomeIcon className="neutral" icon={faMinusCircle} />
      {hit.neutralCount}
      <FontAwesomeIcon className="oppose" icon={faTimesCircle} />
      {hit.opposeCount}
    </div>
  )
}

export const DisplayUpcomingHearing = ({
  nextHearingAt,
  children
}: {
  nextHearingAt: number | Timestamp | undefined
  children: React.ReactNode
}) => {
  if (nextHearingAt && dateInFuture(nextHearingAt)) {
    return <>{children}</>
  }

  return null
}

export const BillHit = ({ hit }: { hit: Hit<BillRecord> }) => {
  const url = maple.bill({ id: hit.number, court: hit.court })
  const hearingDate = hit.nextHearingAt && hit.nextHearingAt / 1000 // convert to seconds
  const { t } = useTranslation("common")

  return (
    <Link href={url} legacyBehavior>
      <a style={{ all: "unset" }} className="w-100">
        <StyledCard>
          <Card.Body>
            <div className="d-flex">
              <Col className="left">
                <div className="d-flex justify-content-between">
                  {hit.court && (
                    <span className="blurb me-2">
                      {t("bill.court", { court: hit.court })}
                    </span>
                  )}
                  <span className="blurb">{hit.city}</span>
                  <span style={{ flex: "1" }} />
                  <TestimonyCount hit={hit} />
                </div>
                <Card.Title as="h6">
                  {formatBillId(hit.number)} -{" "}
                  <Highlight attribute="title" hit={hit} />
                </Card.Title>
                <div className="d-flex justify-content-between flex-column">
                  <span className="blurb">
                    {(() => {
                      const count = hit.cosponsorCount
                      if (!hit.primarySponsor) {
                        return `${t("sponsor")}: ${t("bill.cosponsor_count", {
                          count
                        })}`
                      }
                      let title = `${t("sponsor")}: ${hit.primarySponsor}`
                      if (count) {
                        title += ` ${t("bill.and_others", { count })}`
                      }
                      return title
                    })()}
                  </span>
                  <span className="blurb">
                    {hit.currentCommittee &&
                      `${t("bill.committee")}: ${hit.currentCommittee}`}
                  </span>
                </div>
              </Col>
            </div>
          </Card.Body>
          {hit.nextHearingAt && dateInFuture(hit.nextHearingAt) ? (
            <Card.Footer className="card-footer">
              {t("bill.hearing_scheduled_for", {
                date: fromUnixTime(hearingDate!)
              })}
            </Card.Footer>
          ) : null}
        </StyledCard>
      </a>
    </Link>
  )
}
