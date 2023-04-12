import { Col, Row, Stack } from "react-bootstrap"
import { Internal } from "components/links"
import { Author } from "./Author"
import { Testimony } from "components/db"
import styles from "./ViewTestimony.module.css"
import { ProfilePositionLabel } from "./ProfilePositionBug"

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
    <Stack direction="horizontal" gap={3} className="pb-3">
      <Col xs="auto">
        <ProfilePositionLabel
          position={testimony.position}
          avatar={
            testimony.authorRole === "organization"
              ? "/OrganizationUser.svg"
              : "/individualUser.svg"
          }
        />
      </Col>
      <Col>
        <Author uid={testimony.authorUid} name={testimony.authorDisplayName} />

        <Row className="justify-content-between mb-1">
          <Col className={styles.publishdate} xs="auto">
            {publishedDate}
          </Col>
          <Col xs="auto" className="justify-content-end d-flex">
            {testimony.version > 1 && <p className={styles.editbug}>Edited</p>}
          </Col>
        </Row>
        <hr className={styles.hr}></hr>
      </Col>
    </Stack>
  )
}
