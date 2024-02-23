import { useTranslation } from "next-i18next"
import { Role } from "../auth"
import { Col, Row } from "../bootstrap"
import { FillButton, GearIcon, OutlineButton } from "../buttons"

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
      <Col xs={12} md={2} className={`d-grid gap-2`}>
        <OutlineButton
          className={`py-1`}
          label={t("settings")}
          Icon={GearIcon}
          onClick={() => onSettingsModalOpen()}
        />
        <FillButton
          disabled={!!formUpdated}
          href={`/profile?id=${uid}`}
          label={
            role === "organization" || role === "pendingUpgrade"
              ? t("viewOrgProfile")
              : t("viewMyProfile")
          }
        />
      </Col>
    </Row>
  )
}
