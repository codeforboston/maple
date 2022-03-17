import React, { useState } from "react"
import { Button, Modal, Checkbox, Form } from "react-bootstrap"
import { useAuth } from "../../components/auth"
import { useProfile, useMember } from "../db"
import { useEditTestimony } from "../db/testimony/useEditTestimony"
import * as links from "../../components/links"

const CommentModal = props => {
  const [checkedSendToYourLegislators, setCheckedSendToYourLegislators] =
    React.useState(true)
  const [checkedSendToCommittee, setCheckedSendToCommittee] =
    React.useState(true)

  const useTestimonyTemplate = true
  const testimonyTemplate = `Why I am qualified to provide testimony:

Why this bill is important to me:
  
My thoughts:
`
  const defaultTestimony = useTestimonyTemplate
    ? testimonyTemplate
    : "My comments on this bill..."
  const [testimony, setTestimony] = useState(
    props.testimony ? props.testimony : { content: defaultTestimony }
  )
  const [isPublishing, setIsPublishing] = useState(false)

  const bill = props.bill
  const showTestimony = props.showTestimony
  const handleCloseTestimony = props.handleCloseTestimony

  const { user, authenticated } = useAuth()
  const { profile } = useProfile()

  const senator = useMember(profile?.senator?.id)
  const representative = useMember(profile?.representative?.id)
  const senatorEmail = senator.member?.EmailAddress ?? ""
  const representativeEmail = representative.member?.EmailAddress ?? ""

  const edit = useEditTestimony(user ? user.uid : null, bill.BillNumber)

  const positionMessage = "Select my support..(required)"

  const positionEmailSubject =
    testimony?.position == "endorse"
      ? "Support of"
      : testimony?.position == "oppose"
      ? "Opposition to"
      : "Opinion on"

  const positionWord =
    testimony?.position == "endorse"
      ? "support"
      : testimony?.position == "oppose"
      ? "oppose"
      : "have thoughts on"

  const mailIntroToLegislator = `As your constituent, I am writing to let you know I ${positionWord} ${bill?.BillNumber}: ${bill?.Title}.`
  const mailIntroToCommittee = `I am writing to let you know I ${positionWord} ${bill?.BillNumber}: ${bill?.Title}.`
  const mailToLegislators = encodeURI(
    `mailto:${senatorEmail},${representativeEmail}?subject=${positionEmailSubject} Bill ${
      bill ? bill.BillNumber : ""
    }&body=${
      testimony ? mailIntroToLegislator + "\n\n" + testimony.content : ""
    }`
  )

  const committeeChairEmail = "test@test.com"

  const mailToCommittee = encodeURI(
    `mailto:${committeeChairEmail}?subject=${positionEmailSubject} Bill ${
      bill ? bill.BillNumber : ""
    }&body=${
      testimony ? mailIntroToCommittee + "\n\n" + testimony.content : ""
    }`
  )

  const defaultPosition =
    testimony && testimony.position ? testimony.position : undefined
  const defaultContent =
    testimony && testimony.content ? testimony.content : defaultTestimony

  const EmailToMyLegislators = () => {
    const handleChangeSendToYourLegislators = () => {
      setCheckedSendToYourLegislators(!checkedSendToYourLegislators)
    }

    if (senator.member || representative.member) {
      return (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={checkedSendToYourLegislators}
            id="flexCheckChecked"
            onChange={handleChangeSendToYourLegislators}
          />
          <label className="form-check-label">
            Send copy to your legislatures
          </label>
        </div>
      )
    } else {
      return (
        <links.External href="\profile">
          Add legislators to your profile to share your testimony
        </links.External>
      )
    }
  }

  const EmailToCommittee = () => {
    const handleChangeSendToCommittee = () => {
      setCheckedSendToCommittee(!checkedSendToCommittee)
    }

    return (
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          checked={checkedSendToCommittee}
          id="flexCheckChecked"
          onChange={handleChangeSendToCommittee}
        />
        <label className="form-check-label" htmlFor="flexCheckChecked">
          Send copy to relevant committee
        </label>
      </div>
    )
  }

  const publishTestimony = async () => {
    if (
      testimony.position == undefined ||
      testimony.position == positionMessage
    ) {
      return
    }
    setIsPublishing(true)
    await edit.saveDraft.execute(testimony)
    await edit.publishTestimony.execute()
    handleCloseTestimony()
    setIsPublishing(false)

    if (checkedSendToYourLegislators) {
      window.open(mailToLegislators) // allow user to send a formatted email using their email client
    }

    if (checkedSendToCommittee) {
      window.open(mailToCommittee) // allow user to send a formatted email using their email client
    }
  }

  const positionChosen =
    testimony.position != undefined && testimony.position != positionMessage

  return (
    <Modal show={showTestimony} onHide={handleCloseTestimony} size="lg">
      <Modal.Header closeButton onClick={handleCloseTestimony}>
        <Modal.Title>
          {"Add Your Testimony" +
            (bill ? " for " + bill.BillNumber + " - " + bill.Title : "")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="container">
          <div className="row">
            <div className="col-sm align-middle">
              <select
                className="form-control"
                defaultValue={defaultPosition}
                onChange={e => {
                  const newPosition = e.target.value
                  if (newPosition) {
                    const testimonyObject = {
                      content: testimony.content,
                      senatorId: profile?.senator?.id,
                      representativeId: profile?.representative?.id,
                      senatorDistrict: profile?.senator?.district,
                      representativeDistrict: profile?.representative?.district,
                      position: newPosition
                    }
                    setTestimony(testimonyObject)
                  }
                }}
              >
                <option>{positionMessage}</option>
                <option value="endorse">Endorse</option>
                <option value="oppose">Oppose</option>
                <option value="neutral">Neutral</option>
              </select>
              <div>
                <EmailToMyLegislators />
              </div>
              <div>
                <EmailToCommittee />
              </div>
            </div>

            <div className="col-sm">
              <textarea
                className="form-control col-sm"
                resize="none"
                rows="20"
                required
                defaultValue={defaultContent}
                onChange={e => {
                  const newText = e.target.value
                  const testimonyObject = {
                    position: testimony.position,
                    senatorId: profile?.senator?.id,
                    representativeId: profile?.representative?.id,
                    senatorDistrict: profile?.senator?.district,
                    representativeDistrict: profile?.representative?.district,
                    content: newText
                  }
                  setTestimony(testimonyObject)
                }}
              />
              <Button className="mt-2">Upload a document</Button>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={publishTestimony}>
          {!positionChosen
            ? "Choose Endorse/Oppose/Neutral to Publish"
            : !isPublishing
            ? "Publish"
            : "Publishing.."}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CommentModal
