import { useTranslation } from "next-i18next"
import { Role } from "common/auth/types"
import { Col, Row } from "../bootstrap"
import { GearIcon, OutlineButton } from "../buttons"
import { ProfileEditToggle } from "components/ProfilePage/ProfileButtons"

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
        <ProfileEditToggle formUpdated={formUpdated} role={role} uid={uid} />
      </Col>
    </Row>
  )
}
