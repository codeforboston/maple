import { Col, Row, Stack } from "react-bootstrap"
import { Author } from "./Author"
import { Testimony } from "common/testimony/types"
import { ProfilePositionLabel } from "./ProfilePositionBug"
import { useTranslation } from "next-i18next"

export const UserInfoHeader = ({
  testimony,
  billLink,
  publishedDate
}: {
  testimony: Testimony
  billLink: string
  publishedDate: string
}) => {
  const { t } = useTranslation("testimony")

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
        <Author uid={testimony.authorUid} name={testimony.fullName} />

        <Row className="justify-content-between mb-1">
          <Col className={`mb-0`} xs="auto">
            <small>{publishedDate}</small>
          </Col>
          <Col xs="auto" className="justify-content-end d-flex">
            {testimony.version > 1 && (
              <>
                <p
                  className={`mb-0 bg-secondary lh-sm py-1 px-2 rounded-2 text-white`}
                >
                  <small> {t("userInfoHeader.edited")} </small>
                </p>
              </>
            )}
          </Col>
        </Row>
        <hr className={`m-0 border-bottom border-2`}></hr>
      </Col>
    </Stack>
  )
}
