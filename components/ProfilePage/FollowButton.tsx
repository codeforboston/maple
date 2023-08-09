import { Col, Button } from "react-bootstrap"
import { Internal } from "components/links"
import { StyledImage } from "./StyledProfileComponents"
import { useTranslation } from "next-i18next"

export const FollowButton = ({
  isMobile,
  isFollowing,
  onFollowClick,
  onUnfollowClick
}: {
  isMobile: boolean
  isFollowing: string
  onFollowClick: () => void
  onUnfollowClick: () => void
}) => {
  const { t } = useTranslation("profile")
  const text = isFollowing ? t("button.following") : t("button.follow")
  const checkmark = isFollowing ? (
    <StyledImage src="/check-white.svg" alt="checkmark" />
  ) : null
  const clickFunction = () => {
    isFollowing ? onUnfollowClick() : onFollowClick()
  }

  return (
    <Col className={`d-flex w-100 justify-content-start`}>
      <div>
        <div className="view-edit-profile">
          <Button onClick={clickFunction} className={`btn btn-lg py-1`}>
            {text}
            {checkmark}
          </Button>
        </div>
      </div>
    </Col>
  )
}