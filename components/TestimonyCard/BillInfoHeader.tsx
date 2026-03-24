import { useEffect, useState } from "react"
import { Col, Row } from "react-bootstrap"
import { dbService } from "components/db/api"
import { Internal, maple } from "components/links"
import { Testimony } from "components/db"
import { formatBillId } from "components/formatting"
import { PositionLabel } from "./PositionBug"

const ballotQuestionNumberCache = new Map<string, number | null>()

function formatBallotQuestionLabel(
  ballotQuestionId: string,
  ballotQuestionNumber?: number | null
) {
  return ballotQuestionNumber != null
    ? `Question ${ballotQuestionNumber}`
    : formatBallotQuestionDocumentId(ballotQuestionId)
}

function formatBallotQuestionDocumentId(ballotQuestionId: string) {
  return `Petition ${ballotQuestionId}`
}

export const BillInfoHeader = ({
  testimony,
  billLink,
  publishedDate
}: {
  testimony: Testimony
  billLink: string
  publishedDate: string
}) => {
  const ballotQuestionId = testimony.ballotQuestionId ?? undefined
  const [ballotQuestionNumber, setBallotQuestionNumber] = useState<
    number | null | undefined
  >(ballotQuestionId ? ballotQuestionNumberCache.get(ballotQuestionId) : undefined)

  useEffect(() => {
    if (!ballotQuestionId) {
      setBallotQuestionNumber(undefined)
      return
    }

    const cachedNumber = ballotQuestionNumberCache.get(ballotQuestionId)
    if (cachedNumber !== undefined) {
      setBallotQuestionNumber(cachedNumber)
      return
    }

    let active = true
    dbService()
      .getBallotQuestion({ id: ballotQuestionId })
      .then(ballotQuestion => {
        if (!active) return
        const nextNumber = ballotQuestion?.ballotQuestionNumber ?? null
        ballotQuestionNumberCache.set(ballotQuestionId, nextNumber)
        setBallotQuestionNumber(nextNumber)
      })
      .catch(() => {
        if (!active) return
        ballotQuestionNumberCache.set(ballotQuestionId, null)
        setBallotQuestionNumber(null)
      })

    return () => {
      active = false
    }
  }, [ballotQuestionId])

  const policyLink = ballotQuestionId
    ? maple.ballotQuestion({ id: ballotQuestionId })
    : billLink
  const policyLabel = ballotQuestionId
    ? formatBallotQuestionLabel(ballotQuestionId, ballotQuestionNumber)
    : formatBillId(testimony.billId)
  const policyTitle =
    testimony.billTitle ||
    (ballotQuestionId
      ? formatBallotQuestionDocumentId(ballotQuestionId)
      : "Bill Title")

  return (
    <>
      <Row>
        <Col xs="auto">
          <div className="d-flex align-items-baseline flex-wrap gap-2">
            <h4 className="mt-0 mb-0">
              <Internal className={`text-decoration-none`} href={policyLink}>
                {policyLabel}
              </Internal>
            </h4>
            {ballotQuestionId && ballotQuestionNumber != null && (
              <span className="small text-body-secondary">
                {formatBallotQuestionDocumentId(ballotQuestionId)}
              </span>
            )}
          </div>
        </Col>
        <Col xs="auto" className="p-0 align-items-center d-flex">
          <PositionLabel position={testimony.position} />
        </Col>
      </Row>
      <Row className="mt-1 mb-2">
        <Col>
          <h5 className={`mb-0`}>{policyTitle}</h5>
        </Col>
        <Col className={`ms-auto d-flex justify-content-sm-end`}>
          <p className={`mb-0`}>{publishedDate}</p>
        </Col>
      </Row>
    </>
  )
}
