import type { ModalProps } from "react-bootstrap"
import { Button, Col, Modal, Row, Stack } from "../bootstrap"

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
              <Row className="mx-2">
                <Col md={6}>
                  <Button type="button" onClick={onIndividualUserClick}>
                    Individual User
                  </Button>
                </Col>
                <Col md={6}>
                  <Button type="button" onClick={onOrgUserClick}>
                    Organziation 
                  </Button>
                </Col>
              </Row>
              <p>All Organization types have to go through a request and approval process ran by MAPLE admins. Once yoru request has been approved you will recieve an email and be granted access into MAPLE</p>
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
