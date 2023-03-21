import { Col, Row } from "react-bootstrap"
import { Internal } from "components/links"
import { Testimony } from "components/db"
import { formatBillId } from "components/formatting"
import styles from "./ViewTestimony.module.css"
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
          <h3 className="mt-0 mb-0">
            <Internal className={styles.link} href={billLink}>
              {formatBillId(testimony.billId)}
            </Internal>
          </h3>
        </Col>
        <Col xs="auto">
          <PositionLabel position={testimony.position} />
        </Col>
      </Row>
      <Row>
        <Col></Col>
        <Col className={`ms-auto d-flex justify-content-sm-end`}>
          {`${publishedDate}`}
        </Col>
      </Row>
    </>
  )
}
