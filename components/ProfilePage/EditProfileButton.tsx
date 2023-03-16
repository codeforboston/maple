import { Col, Button } from "react-bootstrap"
import { Internal } from "components/links"

export const EditProfileButton = ({ isMobile }: { isMobile: boolean }) => {
    return (
      <Col
        className={`d-flex w-100 ${
          !isMobile ? "justify-content-end" : "justify-content-start"
        }`}
      >
        <div>
          <Internal href="/editprofile" className="view-edit-profile">
            <Button className={`btn btn-lg py-1`}>Edit&nbsp;Profile</Button>
          </Internal>
        </div>
      </Col>
    )
  }