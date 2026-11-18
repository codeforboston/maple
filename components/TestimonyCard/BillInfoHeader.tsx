import { Col, Row } from "react-bootstrap"
import { Internal } from "components/links"
import { Testimony } from "components/db"
import { useBill } from "components/db/bills"
import { formatBillId } from "components/formatting"
import { PositionLabel } from "./PositionBug"

function formatBallotQuestionLabel(ballotQuestionId: string) {
  return `Ballot Question ${ballotQuestionId}`
}

/** The bill's title, looked up for a testimony that does not carry one: a
 * testimony is given its bill's title only when it is published, so drafts
 * have none. Nothing shows while it loads. */
const FetchedBillTitle = ({
  court,
  billId
}: {
  court: number
  billId: string
}) => {
  const { result: bill } = useBill(court, billId)
  return <>{bill?.content?.Title ?? null}</>
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
  const policyLink = ballotQuestionId
    ? `/ballotQuestions/${ballotQuestionId}`
    : billLink
  const policyLabel = ballotQuestionId
    ? formatBallotQuestionLabel(ballotQuestionId)
    : formatBillId(testimony.billId)
  const policyTitle = testimony.billTitle ? (
    testimony.billTitle
  ) : ballotQuestionId ? (
    formatBallotQuestionLabel(ballotQuestionId)
  ) : (
    <FetchedBillTitle court={testimony.court} billId={testimony.billId} />
  )

  return (
    <>
      <Row>
        <Col xs="auto">
          <h4 className="mt-0 mb-0">
            <Internal className={`text-decoration-none`} href={policyLink}>
              {policyLabel}
            </Internal>
          </h4>
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
