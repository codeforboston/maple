import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../../components/auth"
import * as links from "../../components/links"
import { Alert, Button, Col, Container, Modal, Row } from "../bootstrap"
import { useEditTestimony } from "../db/testimony/useEditTestimony"
import { useDraftTestimonyAttachment } from "../db/testimony/useTestimonyAttachment"
import { useUnsavedTestimony } from "../db/testimony/useUnsavedTestimony"
import { FormattedBillTitle } from "../formatting"
import { Attachment } from "./Attachment"
import PostSubmitModal from "./PostSubmitModal"

const CommentModal = ({
  bill,
  committeeName,
  houseChairEmail,
  senateChairEmail,
  showTestimony,
  handleCloseTestimony,
  refreshtable
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

  const [isPublishing, setIsPublishing] = useState(false)
  const [showPostSubmitModal, setShowPostSubmitModal] = useState(false)
  const [publishError, setPublishError] = useState(false)
  const [testimony, setTestimony] = useUnsavedTestimony()

  const billInfo = bill.content === undefined ? bill : bill.content
  const edit = useEditTestimony(user ? user.uid : null, billInfo.BillNumber)
  const attachment = useDraftTestimonyAttachment(
    user.uid,
    edit.draft?.attachmentId,
    id => setTestimony({ attachmentId: id })
  )

  useEffect(() => {
    const testimony = edit.publication
      ? edit.publication
      : edit.draft
      ? edit.draft
      : {}
    setTestimony(testimony)
  }, [edit.draft, edit.publication, setTestimony])

  const positionMessage = "Select my support..(required)"

  const defaultPosition =
    testimony && testimony.position ? testimony.position : undefined

  const defaultContent =
    testimony && testimony.content ? testimony.content : undefined

  const publishTestimony = useCallback(async () => {
    try {
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
      setShowPostSubmitModal(true)
    } catch (err) {
      console.error(err)
      setIsPublishing(false)
      setPublishError(err.message)
    }
  }, [edit.publishTestimony, edit.saveDraft, testimony])

  const existingTestimony = !_.isEmpty(testimony)
  const positionChosen =
    testimony?.position != undefined && testimony.position != positionMessage
  const testimonyWritten = testimony?.content != undefined

  return (
    <>
      <Modal show={showTestimony} onHide={handleCloseTestimony} size="lg">
        <Modal.Header closeButton onClick={handleCloseTestimony}>
          <Modal.Title className="w-100">
            {edit.publication ? (
              <h4>Edit Your Testimony</h4>
            ) : (
              <h4>Add Your Testimony</h4>
            )}
            <FormattedBillTitle bill={bill} />
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Container>
            <div>
              <h5>Select your position</h5>
            </div>
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
                <div className="mt-2">
                  <h5>Enter your testimony</h5>
                </div>
                <textarea
                  className="form-control col-sm"
                  resize="none"
                  rows="20"
                  placeholder={"enter text..."}
                  defaultValue={existingTestimony ? defaultContent : null}
                  required
                  onChange={e => {
                    const newText = e.target.value
                    setTestimony({ content: newText })
                  }}
                />
              </Col>
            </Row>
            <Row className="mt-2">
              <Attachment attachment={attachment} />
            </Row>
          </Container>
        </Modal.Body>

        {publishError && (
          <Alert variant="danger" className="text-center">
            {publishError}
            {" ! "}
            <Link href={`/profile?id=${user.uid}`}>
              Navigate to the profile
            </Link>
          </Alert>
        )}

        <Modal.Footer>
          <Button
            variant="primary"
            onClick={publishTestimony}
            disabled={publishError}
          >
            {!positionChosen
              ? "Choose Endorse/Oppose/Neutral to Publish"
              : !testimonyWritten
              ? "Write Testimony to Publish"
              : !isPublishing
              ? "Publish"
              : "Publishing..."}
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
        refreshtable={refreshtable}
      />
    </>
  )
}

export default CommentModal
