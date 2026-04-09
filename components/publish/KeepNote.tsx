import styled from "styled-components"
import { useState } from "react"
import { Image, Button, Modal, Col, Row } from "../bootstrap"
import { Step } from "./redux"
import { Internal } from "components/links"
import { usePublishCopy, usePublishMode } from "./hooks"
import { Trans, useTranslation } from "next-i18next"

export const KeepNote = (props: { currentStep: Step }) => {
  const { t } = useTranslation("testimony")
  const isBallotQuestion = usePublishMode() === "ballotQuestion"
  return (
    <NoteContainer className="p-0">
      <HeaderContainer>
        {t("submitTestimonyForm.keepNote.header")}
      </HeaderContainer>
      {props.currentStep == "selectLegislators" ||
      props.currentStep == "write" ? (
        isBallotQuestion ? (
          <BallotQuestionYourTestimony />
        ) : (
          <YourTestimony />
        )
      ) : (
        <PublishingToMAPLE />
      )}
    </NoteContainer>
  )
}

export const KeepNoteMobile = () => {
  const { t, copy } = usePublishCopy()
  const isBallotQuestion = usePublishMode() === "ballotQuestion"
  const [showYourTestimony, setShowYourTestimony] = useState(false)
  const [showPublishingToMAPLE, setShowPublishingToMAPLE] = useState(false)

  const handleCloseYourTestimony = () => setShowYourTestimony(false)
  const handleShowYourTestimony = () => setShowYourTestimony(true)

  const handleClosePublishingToMAPLE = () => setShowPublishingToMAPLE(false)
  const handleShowPublishingToMAPLE = () => setShowPublishingToMAPLE(true)

  return (
    <Col className="py-1">
      <Row xs={12}>
        <p style={{ fontWeight: "bolder" }}>
          {copy(
            "submitTestimonyForm.keepNote.about",
            "ballotQuestion.submitTestimonyForm.keepNote.about"
          )}
        </p>
      </Row>

      <Row xs={12} className="my-3">
        <Button variant="outline-secondary" onClick={handleShowYourTestimony}>
          {copy(
            "submitTestimonyForm.keepNote.howTestimoniesWork",
            "ballotQuestion.submitTestimonyForm.keepNote.howTestimoniesWork"
          )}
        </Button>
      </Row>

      <Row xs={12} className="my-3">
        <Button
          variant="outline-secondary"
          onClick={handleShowPublishingToMAPLE}
        >
          {t("submitTestimonyForm.keepNote.publishing")}
        </Button>
      </Row>

      <Modal show={showYourTestimony} onHide={handleCloseYourTestimony}>
        <Modal.Header closeButton>
          <Modal.Title>
            {copy(
              "submitTestimonyForm.keepNote.howTestimoniesWork",
              "ballotQuestion.submitTestimonyForm.keepNote.howTestimoniesWork"
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isBallotQuestion ? (
            <BallotQuestionYourTestimony />
          ) : (
            <YourTestimony />
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showPublishingToMAPLE} onHide={handleClosePublishingToMAPLE}>
        <Modal.Header closeButton>
          <Modal.Title>
            {t("submitTestimonyForm.keepNote.publishing")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PublishingToMAPLE />
        </Modal.Body>
      </Modal>
    </Col>
  )
}

export const YourTestimony = () => {
  const { t } = useTranslation("testimony")
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
      <NoteSubtitle>
        {t("submitTestimonyForm.keepNote.keepInMind")}
      </NoteSubtitle>
      <ul>
        <NoteItem>
          <u>{t("submitTestimonyForm.keepNote.noEmailWarning")}</u>
          {t("submitTestimonyForm.keepNote.emailPreview")}
        </NoteItem>
        <NoteItem>{t("submitTestimonyForm.keepNote.shareEmail")}</NoteItem>
        <NoteItem>{t("submitTestimonyForm.keepNote.thankYou")}</NoteItem>
      </ul>
    </NoteContent>
  )
}

export const BallotQuestionYourTestimony = () => {
  const { t } = useTranslation("testimony")
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
      <NoteSubtitle>
        {t("submitTestimonyForm.keepNote.keepInMind")}
      </NoteSubtitle>
      <ul>
        <NoteItem>
          {t("ballotQuestion.submitTestimonyForm.keepNote.emailPreview")}
        </NoteItem>
        <NoteItem>
          {t("ballotQuestion.submitTestimonyForm.keepNote.shareEmail")}
        </NoteItem>
        <NoteItem>
          {t("ballotQuestion.submitTestimonyForm.keepNote.thankYou")}
        </NoteItem>
      </ul>
    </NoteContent>
  )
}

export const PublishingToMAPLE = () => {
  const { t, copy, isBallotQuestion } = usePublishCopy()
  return (
    <NoteContent>
      <div className="text-center">
        <Image className="mx-auto" alt="" src="/computertextblob.svg" />
      </div>
      <NoteSubtitle>
        {copy(
          "submitTestimonyForm.keepNote.rulesHeader",
          "ballotQuestion.submitTestimonyForm.keepNote.rulesHeader"
        )}
      </NoteSubtitle>
      <ul style={{ color: "var(--bs-blue)" }}>
        <NoteItem>
          {copy(
            "submitTestimonyForm.keepNote.editLimit",
            "ballotQuestion.submitTestimonyForm.keepNote.editLimit"
          )}
        </NoteItem>
        <NoteItem>
          <Trans
            t={t}
            i18nKey={
              isBallotQuestion
                ? "ballotQuestion.submitTestimonyForm.keepNote.cannotDelete"
                : "submitTestimonyForm.keepNote.cannotDelete"
            }
            // eslint-disable-next-line react/jsx-key
            components={[<Internal href="/about/faq-page" />]}
          />
        </NoteItem>
        {!isBallotQuestion && (
          <NoteItem>{t("submitTestimonyForm.keepNote.emailReminder")}</NoteItem>
        )}
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
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0.015em;
    text-align: left;
    padding-right: 1rem;
  `
