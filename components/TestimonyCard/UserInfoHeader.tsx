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
        <h4 className={styles.heading}>{testimony.authorDisplayName}</h4>
      </Col>

      <Col className={`mb-0 ms-auto d-flex justify-content-sm-end`}>
        {`${publishedDate}`}
      </Col>
    </>
  )
}
