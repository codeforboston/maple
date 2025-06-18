import { Col, Row } from "react-bootstrap"
import { Internal } from "components/links"
import { Testimony } from "common/testimony/types"
import { formatBillId } from "components/formatting"
import { PositionLabel } from "./PositionBug"

export const BillInfoHeader = ({
  testimony,
  billLink,
  publishedDate
}: {
  testimony: Testimony
  billLink: string
  publishedDate: string
}) => {
  return (
    <>
      <Row>
        <Col xs="auto">
          <h4 className="mt-0 mb-0">
            <Internal className={`text-decoration-none`} href={billLink}>
              {formatBillId(testimony.billId)}
            </Internal>
          </h4>
        </Col>
        <Col xs="auto" className="p-0 align-items-center d-flex">
          <PositionLabel position={testimony.position} />
        </Col>
      </Row>
      <Row className="mt-1 mb-2">
        <Col>
          <h5 className={`mb-0`}>
            {" "}
            {testimony.billTitle ? testimony.billTitle : "Bill Title"}
          </h5>
        </Col>
        <Col className={`ms-auto d-flex justify-content-sm-end`}>
          <p className={`mb-0`}>{publishedDate}</p>
        </Col>
      </Row>
    </>
  )
}
