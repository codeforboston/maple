import { useTranslation } from "next-i18next"
import { Role } from "../auth"
import { Col, Row } from "../bootstrap"
import { GearIcon, OutlineButton } from "../buttons"
import { ProfileEditToggle } from "components/ProfilePage/ProfileButtons"

export const EditProfileHeader = ({
  formUpdated,
  onSettingsModalOpen,
  onGetVerifiedClick,
  uid,
  role,
  phoneVerified
}: {
  formUpdated: boolean
  onSettingsModalOpen: () => void
  onGetVerifiedClick?: () => void
  uid: string
  role: Role
  phoneVerified?: boolean
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
        {phoneVerified === true ? (
          <div className="d-flex align-items-center justify-content-center gap-1 py-1 col-12 text-capitalize text-nowrap">
            <span className="text-secondary">{t("verifiedUser")}</span>
            <img
              src="/images/verifiedUser.png"
              alt={t("verifiedUserBadgeAlt")}
              width={24}
              height={24}
              className="flex-shrink-0"
            />
          </div>
        ) : onGetVerifiedClick ? (
          <OutlineButton
            className={`py-1`}
            label={t("getVerified")}
            onClick={onGetVerifiedClick}
          />
        ) : null}
      </Col>
    </Row>
  )
}
