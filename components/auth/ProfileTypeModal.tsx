import type { ModalProps } from "react-bootstrap"
import { Button, Col, Modal, Row, Stack, Image } from "../bootstrap"
import styled from "styled-components"

export const StyledButton = styled(Button)`
  width: 100%;
  height: 15rem;
  margin: 0;
  margin-bottom: 1rem;
  text-align: left;
  font-family: Nunito;

  p {
    font-size: 16px;
    margin: 0;
  }

  Image {
    margin: 0;
  }
`

export default function ProfileTypeModal({
  show,
  onHide,
  onIndividualUserClick,
  onOrgUserClick
}: Pick<ModalProps, "show" | "onHide"> & {
  onHide: () => void
  onIndividualUserClick: () => void
  onOrgUserClick: () => void
}) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="sign-up-modal"
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="sign-up-modal">Sign Up</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={12} className="mx-auto">
          <Stack gap={2} direction="vertical">
            <h2>Register as</h2>
            <Stack gap={4} direction="horizontal">
              <StyledButton
                type="button"
                variant="secondary"
                onClick={onIndividualUserClick}
              >
                <Row>
                  <Col xs="auto" className="d-flex align-items-center">
                    <Image
                      alt="profile icon"
                      src="profile-individual-white.svg"
                    />
                  </Col>

                  <Col>
                    <p>
                      <b>Individual User</b>
                    </p>
                    <p>
                      An individual user, which also includes any
                      non-incorporated Massachusetts based organizations
                    </p>
                  </Col>
                </Row>
              </StyledButton>

              <StyledButton
                type="button"
                variant="secondary"
                onClick={onOrgUserClick}
              >
                <Row>
                  <Col xs="auto" className="d-flex align-items-center">
                    <Image alt="profile icon" src="profile-org-white.svg" />
                  </Col>

                  <Col>
                    <p>
                      <b>Organization</b>
                    </p>
                    <p>
                      Only available for incorporated Massachusetts
                      Organizations
                    </p>
                  </Col>
                </Row>
              </StyledButton>
            </Stack>
            <p>
              All Organization types have to go through a request and approval
              process ran by MAPLE admins. Once your request has been approved
              you will recieve an email and be granted access into MAPLE
            </p>
            <hr />
            <Button type="button" onClick={onHide}>
              Cancel
            </Button>
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
