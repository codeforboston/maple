import styled from "styled-components"
import { useState } from "react"
import { Image, Button, Modal, Col, Row } from "../bootstrap"
import { Step } from "./redux"

export const KeepNote = (props: { currentStep: Step }) => {
  return (
    <NoteContainer className="p-0">
      <HeaderContainer>Keep Note</HeaderContainer>
      {props.currentStep == "selectLegislators" ||
      props.currentStep == "write" ? (
        <YourTestimony />
      ) : (
        <PublishingToMAPLE />
      )}
    </NoteContainer>
  )
}

export const KeepNoteMobile = () => {
  const [showYourTestimony, setShowYourTestimony] = useState(false)
  const [showPublishingToMAPLE, setShowPublishingToMAPLE] = useState(false)

  const handleCloseYourTestimony = () => setShowYourTestimony(false)
  const handleShowYourTestimony = () => setShowYourTestimony(true)

  const handleClosePublishingToMAPLE = () => setShowPublishingToMAPLE(false)
  const handleShowPublishingToMAPLE = () => setShowPublishingToMAPLE(true)

  return (
    <Col className="py-1">
      <Row xs={12}>
        <p style={{ fontWeight: "bolder" }}>About MAPLE Testimony</p>
      </Row>

      <Row xs={12} className="my-3">
        <Button variant="outline-secondary" onClick={handleShowYourTestimony}>
          How MAPLE Testimonies Work
        </Button>
      </Row>

      <Row xs={12} className="my-3">
        <Button
          variant="outline-secondary"
          onClick={handleShowPublishingToMAPLE}
        >
          Publishing to MAPLE
        </Button>
      </Row>

      <Modal show={showYourTestimony} onHide={handleCloseYourTestimony}>
        <Modal.Header closeButton>
          <Modal.Title>How MAPLE Testimonies Work</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <YourTestimony />
        </Modal.Body>
      </Modal>

      <Modal show={showPublishingToMAPLE} onHide={handleClosePublishingToMAPLE}>
        <Modal.Header closeButton>
          <Modal.Title>Publishing to MAPLE</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PublishingToMAPLE />
        </Modal.Body>
      </Modal>
    </Col>
  )
}

export const YourTestimony = () => {
  return (
    <NoteContent>
      <div className="text-center">
        <Image
          className="px-5"
          alt=""
          src="/mailbox.svg"
          style={{ transform: "scaleY(0.85)" }}
        />
      </div>
      <NoteSubtitle>Please keep in mind...</NoteSubtitle>
      <ul>
        <NoteItem>
          <u>We do not send an email for you.</u> This is a preview of what your
          email to legislators will look like. On the next page, you will be
          asked to “send email” which will open your email client (e.g.,
          Outlook) and populate an email with your testimony.
        </NoteItem>
        <NoteItem>
          Your testimony needs to be shared with the right legislators. Your
          email “To:” box will be populated with the legislators you add here.
          We've pre-populated this with the most relevant legislators: 1) the
          Chairs of the Committee reviewing this bill; and 2) your own
          legislators.
        </NoteItem>
        <NoteItem>
          When you send this email, you are submitting formal public testimony!
          As fellow constituents, we thank you for your sharing your voice.
        </NoteItem>
      </ul>
    </NoteContent>
  )
}

export const PublishingToMAPLE = () => {
  return (
    <NoteContent>
      <div className="text-center">
        <Image className="mx-auto" alt="" src="/computertextblob.svg" />
      </div>
      <NoteSubtitle>Rules for Testimony on MAPLE:</NoteSubtitle>
      <ul style={{ color: "var(--bs-blue)" }}>
        <NoteItem>
          You can edit your testimony up to 5 times but the previous versions
          will remain available.
        </NoteItem>
        <NoteItem>
          Since MAPLE is an archive you cannot remove your testimony from the
          site.
        </NoteItem>
        <NoteItem>Don't forget to send the email to your legislator.</NoteItem>
      </ul>
    </NoteContent>
  )
}

const NoteContainer = styled.div`
    background: var(--bs-body-bg);
    display: flex;
    flex-direction: column;
    padding: 0rem 0rem 1rem 0rem;
    height: 100%;
  `,
  HeaderContainer = styled.h4`
    background: var(--bs-orange);
    color: var(--bs-white);
    padding: 1rem 0rem 1rem 0rem;
    text-align: center;
  `,
  NoteSubtitle = styled.p`
    color: var(--bs-blue);
    font-weight: 700;
    padding: 10px;
  `,
  NoteContent = styled.div`
    line-height: normal;
  `,
  NoteItem = styled.li`
    margin-top: 20px;
    font-weight: 500;
    font-family: Nunito;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0.015em;
    text-align: left;
    padding-right: 1rem;
  `
