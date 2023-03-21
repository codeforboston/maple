import { Col, Button } from "react-bootstrap"
import { Internal } from "components/links"

export const EditProfileButton = ({
  isMobile,
  isOrg
}: {
  isMobile: boolean
  isOrg: boolean
}) => {
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
          <Button className={`btn btn-lg py-1`}>Edit&nbsp;Profile</Button>
        </Internal>
      </div>
    </Col>
  )
}
