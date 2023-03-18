import { FC, ReactNode } from "react"
import type { ButtonProps, ModalProps } from "react-bootstrap"
import styled from "styled-components"
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
            <Row>
              <Col lg={6} className="my-2">
                <ProfileTypeButton
                  onClick={onIndividualUserClick}
                  icon="/profile-individual-icon.svg"
                  title="Individual User"
                  description={
                    <>
                      An individual user, which also includes any
                      non-incorporated Massachusetts based organizations
                    </>
                  }
                />
              </Col>
              <Col lg={6} className="my-2">
                <ProfileTypeButton
                  onClick={onOrgUserClick}
                  icon="/profile-org-icon.svg"
                  title="Organization User"
                  description={
                    <>
                      Only available for Incoporated Massachusetts Organizations
                    </>
                  }
                />
              </Col>
            </Row>
            <p>
              All Organization accounts must be reviewed. Once your request is
              approved, you will be emailed and able to post as an organization.
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

// A component that renders a button  with a label, icon, and description
const ProfileTypeButton = styled<
  {
    icon: string
    title: string
    description: ReactNode
  } & ButtonProps
>(({ icon, title, description, ...props }) => {
  return (
    <Button type="button" variant="secondary" {...props}>
      <div className="d-flex">
        <div className="icon my-auto" />
        <div className="content d-flex flex-column">
          <h5>
            <b>{title}</b>
          </h5>
          <p className="text-left">{description}</p>
        </div>
      </div>
    </Button>
  )
})`
  width: 100%;
  height: 100%;

  .content {
    margin-left: 1rem;
    flex-grow: 1;
    text-align: left;
  }

  .icon {
    width: 3rem;
    height: 3rem;
    background-color: white;
    mask: ${({ icon }) => `url(${icon}) no-repeat`};
    mask-size: contain;
    flex-shrink: 0;
  }
`
