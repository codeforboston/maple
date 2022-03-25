import React, { useState } from "react"
import { Button, Modal } from "react-bootstrap"
import { useAuth } from "../../components/auth"
import { useProfile, useMember } from "../db"
import { useEditTestimony } from "../db/testimony/useEditTestimony"
import EmailToMyLegislators from "./EmailToMyLegislators"
import EmailToCommittee from "./EmailToCommittee"
import TweetModal from "../TweetModal/TweetModal"

const testimonyEmailAddress = "archive@digitaltestimony.com"
const webSiteBillAddress = "https://digital-testimony-dev.web.app/bill?id="

const CommentModal = props => {
  const bill = props.bill
  const [checkedSendToYourLegislators, setCheckedSendToYourLegislators] =
    React.useState(true)
  const [checkedSendToCommittee, setCheckedSendToCommittee] = React.useState(
    props.committeeName
  ) // only default checkbox to checked if the bill is in a committee
  const [checkedTweet, setCheckedTweet] = React.useState(true)

  // const [showTweetModal, setShowTweetModal] = useState(false)

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
  const committeeName = props.committeeName
  const houseChairEmail = props.houseChairEmail
  const senateChairEmail = props.senateChairEmail
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

  const emailSuffix = `See more testimony on this bill at ${webSiteBillAddress}${bill.BillNumber}`

  const legislatorEmails =
    representativeEmail && senatorEmail
      ? representativeEmail + "," + senatorEmail
      : representativeEmail
      ? representativeEmail
      : senatorEmail
      ? senatorEmail
      : null

  const mailIntroToLegislator = `As your constituent, I am writing to let you know I ${positionWord} ${bill?.BillNumber}: ${bill?.Title}.`

  const mailToLegislators = !legislatorEmails
    ? null
    : encodeURI(
        `mailto:${testimonyEmailAddress}?subject=${positionEmailSubject} Bill ${
          bill ? bill.BillNumber : ""
        }&cc=${legislatorEmails}&body=${
          testimony
            ? mailIntroToLegislator +
              "\n\n" +
              testimony.content +
              "\n\n" +
              emailSuffix
            : ""
        }`
      )

  const committeeEmails =
    houseChairEmail && senateChairEmail
      ? houseChairEmail + "," + senateChairEmail
      : houseChairEmail
      ? houseChairEmail
      : senateChairEmail
      ? senateChairEmail
      : null

  const mailIntroToCommittee = `I am writing to let you know I ${positionWord} ${
    bill?.BillNumber
  }: ${bill?.Title} ${
    committeeName ? "that is before the " + committeeName : ""
  }.`

  const mailToCommittee = !committeeEmails
    ? null
    : encodeURI(
        `mailto:${testimonyEmailAddress}?subject=${positionEmailSubject} Bill ${
          bill ? bill.BillNumber : ""
        }&cc=${committeeEmails}&body=${
          testimony
            ? mailIntroToCommittee +
              "\n\n" +
              testimony.content +
              "\n\n" +
              emailSuffix
            : ""
        }`
      )

  const defaultPosition =
    testimony && testimony.position ? testimony.position : undefined
  const defaultContent =
    testimony && testimony.content ? testimony.content : defaultTestimony

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
    if (checkedSendToYourLegislators) {
      window.open(mailToLegislators) // allow user to send a formatted email using their email client
    }
    if (checkedSendToCommittee && mailToCommittee) {
      window.open(mailToCommittee) // allow user to send a formatted email using their email client
    }
    // console.log("opening tweet modal")
    // setShowTweetModal(true)
    handleCloseTestimony()
    setIsPublishing(false)
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
                <EmailToMyLegislators
                  checkedSendToYourLegislators={checkedSendToYourLegislators}
                  setCheckedSendToYourLegislators={
                    setCheckedSendToYourLegislators
                  }
                  senator={senator}
                  representative={representative}
                />
              </div>
              <div>
                <EmailToCommittee
                  checkedSendToCommittee={checkedSendToCommittee}
                  setCheckedSendToCommittee={setCheckedSendToCommittee}
                  committeeName={committeeName}
                />
              </div>
              <div>
                <EmailToCommittee
                  checkedSendToCommittee={checkedSendToCommittee}
                  setCheckedSendToCommittee={setCheckedSendToCommittee}
                  committeeName={committeeName}
                />
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
              {/* <TweetModal
                bill={bill}
                testimony={testimony}
                showTweetModal={showTweetModal}
                setShowTweetModal={setShowTweetModal}
              /> */}
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
