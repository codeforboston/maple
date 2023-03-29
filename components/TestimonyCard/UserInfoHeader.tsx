import { Col, Stack } from "react-bootstrap"
import { Internal } from "components/links"
import { Testimony } from "components/db"
import { formatBillId } from "components/formatting"
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
      <Col className="justify-content-start">
        <h6>{testimony.authorDisplayName}</h6>

        {publishedDate}
        <hr className={styles.hr}></hr>
      </Col>
    </Stack>
  )
}
