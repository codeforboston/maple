import React, { useEffect, useState } from "react"
import { Button, Col, Container, Modal, Row } from "../bootstrap"
import { useAuth } from "../../components/auth"
import { useEditTestimony } from "../db/testimony/useEditTestimony"
import { useDraftTestimonyAttachment } from "../db/testimony/useTestimonyAttachment"
import { useUnsavedTestimony } from "../db/testimony/useUnsavedTestimony"
import { Attachment } from "./Attachment"
import PostSubmitModal from "./PostSubmitModal"
import * as links from "../../components/links"
import { FormattedBillTitle } from "../formatting"

const CommentModal = ({
  bill,
  committeeName,
  houseChairEmail,
  senateChairEmail,
  showTestimony,
  handleCloseTestimony
}) => {
  const { user } = useAuth()
  const testimonyExplanation = (
    <div>
      <h5> Guidance on providing testimony</h5>
      In general, provide:
      <ul>
        <li>Your background</li>
        <li>Why this bill is important to you</li>
        <li>Your thoughts on the bill</li>
      </ul>
      <div>
        <links.External href="/legprocess">
          Learn more about submitting testimony
        </links.External>
      </div>
    </div>
  )

  const billInfo = bill.content === undefined ? bill : bill.content

  const [isPublishing, setIsPublishing] = useState(false)
  const [showPostSubmitModal, setShowPostSubmitModal] = useState(false)

  const [testimony, setTestimony] = useUnsavedTestimony()

  const edit = useEditTestimony(user ? user.uid : null, billInfo.BillNumber)
  const attachment = useDraftTestimonyAttachment(
    user.uid,
    edit.draft,
    setTestimony
  )

  useEffect(() => {
    const testimony = edit.publication ? edit.publication : edit.draft ? edit.draft : {}
    setTestimony(testimony)
  }, [edit.draft, edit.publication, setTestimony])

  const positionMessage = "Select my support..(required)"

  const defaultPosition =
    testimony && testimony.position ? testimony.position : undefined
  
  const defaultContent =
    testimony && testimony.content ? testimony.content : undefined


  const publishTestimony = async () => {
    if (
      testimony.position == undefined ||
      testimony.position == positionMessage ||
      !testimony.content
    ) {
      return
    }
    setIsPublishing(true)
    await edit.saveDraft.execute(testimony)
    await edit.publishTestimony.execute()
    setIsPublishing(false)
    handleCloseTestimony()
    setShowPostSubmitModal(true)
  }

  const existingTestimony = !_.isEmpty(testimony)
  const positionChosen =
    testimony?.position != undefined && testimony.position != positionMessage
  const testimonyWritten = testimony?.content != undefined


  return (
    <>
      <Modal show={showTestimony} onHide={handleCloseTestimony} size="lg">
        <Modal.Header closeButton onClick={handleCloseTestimony}>
          <Modal.Title>
            <div className="d-flex justify-content-center">
              {existingTestimony ? <h4>Edit Your Testimony</h4> : <h4>Add Your Testimony</h4>}
            </div>
            <FormattedBillTitle bill={bill} />
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Container>
            <select
              className="form-control"
              defaultValue={defaultPosition}
              onChange={e => {
                const newPosition = e.target.value
                if (newPosition) {
                  setTestimony({ position: newPosition })
                }
              }}
            >
              <option>{positionMessage}</option>
              <option value="endorse">Endorse</option>
              <option value="oppose">Oppose</option>
              <option value="neutral">Neutral</option>
            </select>
            <Row>
              <Col className="col-sm mt-2">
                {testimonyExplanation}
                <textarea
                  className="form-control col-sm"
                  resize="none"
                  rows="20"
                  placeholder={existingTestimony ? null : "enter text..."}
                  defaultValue={existingTestimony ? defaultContent : null}
                  required
                  onChange={e => {
                    const newText = e.target.value
                    setTestimony({ content: newText })
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Attachment attachment={attachment} />
            </Row>
          </Container>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={publishTestimony}>
            {!positionChosen
              ? "Choose Endorse/Oppose/Neutral to Publish"
              : !testimonyWritten
                ? "Write Testimony to Publish"
                : !isPublishing
                  ? "Publish"
                  : "Publishing.."}
          </Button>
        </Modal.Footer>
      </Modal>
      <PostSubmitModal
        showPostSubmitModal={showPostSubmitModal}
        setShowPostSubmitModal={setShowPostSubmitModal}
        handleCloseTestimony={handleCloseTestimony}
        bill={billInfo}
        testimony={testimony}
        senateChairEmail={senateChairEmail}
        houseChairEmail={houseChairEmail}
        committeeName={committeeName}
      />
    </>
  )
}

export default CommentModal
