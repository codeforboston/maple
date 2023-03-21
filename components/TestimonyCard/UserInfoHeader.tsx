import { Col } from "react-bootstrap"
import { Internal } from "components/links"
import { Testimony } from "components/db"
import { formatBillId } from "components/formatting"
import styles from "./ViewTestimony.module.css"
import { PositionLabel } from "./PositionBug"

export const UserInfoHeader = ({
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
      <Col xs="auto">
        <h3 className="mt-0 mb-0">{testimony.authorDisplayName}</h3>
      </Col>

      <Col className={`ms-auto d-flex justify-content-sm-end`}>
        {`${publishedDate}`}
      </Col>
    </>
  )
}
