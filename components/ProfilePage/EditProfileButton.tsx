import { Col, Button } from "react-bootstrap"
import { Internal } from "components/links"
import { useTranslation } from "next-i18next"

export const EditProfileButton = ({
  isMobile,
  isOrg
}: {
  isMobile: boolean
  isOrg: boolean
}) => {
  const { t } = useTranslation("profile")
  return (
    <Col
      className={
        isOrg
          ? `d-flex w-100 justify-content-start`
          : `d-flex w-100 justify-content-end`
      }
    >
      <div>
        <Internal href="/editprofile" className="view-edit-profile">
          <Button className={`btn btn-lg py-1`}>
            {t("button.editProfile")}
          </Button>
        </Internal>
      </div>
    </Col>
  )
}
