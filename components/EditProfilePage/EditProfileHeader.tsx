import { useTranslation } from "next-i18next"
import { Role } from "../auth"
import { Button, Col, Row, Stack } from "../bootstrap"
import { GearButton } from "../buttons"

export const EditProfileHeader = ({
  formUpdated,
  onSettingsModalOpen,
  uid,
  role
}: {
  formUpdated: boolean
  onSettingsModalOpen: () => void
  uid: string
  role: Role
}) => {
  const { t } = useTranslation("editProfile")

  return (
    <Row className={`my-5`}>
      <Col className={`align-self-end`}>
        <h1 className={`display-3`}>{t("header")}</h1>
      </Col>
      <Col xs={12} md={2} className={`d-grid gap-2 justify-content-end`}>
        <GearButton
          variant="outline-secondary"
          disabled={!!formUpdated}
          onClick={() => onSettingsModalOpen()}
        >
          {t("settings")}
        </GearButton>
        <Button
          className={`btn py-1 fs-5 ml-2 text-decoration-none text-nowrap`}
          disabled={!!formUpdated}
          href={`/profile?id=${uid}`}
        >
          {role !== "organization" ? t("viewMyProfile") : t("viewOrgProfile")}
        </Button>
      </Col>
    </Row>
  )
}
