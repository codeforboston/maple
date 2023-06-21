import { Highlight } from "@alexjball/react-instantsearch-hooks-web"
import {
  faCheckCircle,
  faMinusCircle,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { maple } from "components/links"
import { format, fromUnixTime } from "date-fns"
import { Hit } from "instantsearch.js"
import Link from "next/link"
import styled from "styled-components"
import { Card, Col } from "../../bootstrap"
import { formatBillId } from "../../formatting"

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
  border: none;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  overflow: hidden;

  cursor: pointer;
  outline-color: var(--bs-blue);
  outline-style: solid;
  outline-width: 0;
  transition: outline-width 0.1s;

  font-size: 0.75rem;

  &:hover {
    outline-width: 2px;
  }

  &:active {
    outline-width: 4px;
  }

  .card-body {
    padding: 0;
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
    padding: 0.5rem;
    padding-right: 1rem;
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

export const BillHit = ({ hit }: { hit: Hit<BillRecord> }) => {
  const url = maple.bill({ id: hit.number, court: hit.court })
  return (
    <Link href={url}>
      <a style={{ all: "unset" }} className="w-100">
        <StyledCard>
          <Card.Body>
            <div className="d-flex">
              <Col className="left">
                <div className="d-flex justify-content-between">
                  {hit.court && (
                    <span className="blurb me-2">Court {hit.court}</span>
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
                    Sponsor: {hit.primarySponsor}{" "}
                    {hit.cosponsorCount > 0
                      ? `and ${hit.cosponsorCount} other${
                          hit.cosponsorCount > 1 ? "s" : ""
                        }`
                      : ""}
                  </span>
                  <span className="blurb">
                    {hit.currentCommittee &&
                      `Committee: ${hit.currentCommittee}`}
                  </span>
                </div>
              </Col>
            </div>
          </Card.Body>
          {hit.nextHearingAt ? (
            <Card.Footer className="card-footer">
              Hearing Scheduled{" "}
              {format(fromUnixTime(hit.nextHearingAt / 1000), "M/d/y p")}
            </Card.Footer>
          ) : null}
        </StyledCard>
      </a>
    </Link>
  )
}
