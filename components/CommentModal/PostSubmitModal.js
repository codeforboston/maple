import React, { useEffect, useState } from "react"
import { siteUrl } from "../links"
import { Button, Col, Container, Modal, Row } from "../bootstrap"
import { useMember, useProfile } from "../db"

import EmailToMyLegislatorsComponent from "./EmailToMyLegislatorsComponent"
import EmailToCommitteeComponent from "./EmailToCommitteeComponent"
import TweetComponent from "./TweetComponent"

import createCommitteeChairEmailCommand from "./createCommitteeChairEmailCommand"
import createMyLegislatorEmailCommand from "./createMyLegislatorEmailCommand"

const PostSubmitModal = ({
  showPostSubmitModal,
  setShowPostSubmitModal,
  setIsPublishing,
  handleCloseTestimony,
  bill,
  testimony,
  senateChairEmail,
  houseChairEmail,
  committeeName
}) => {
  const billNumber = bill?.BillNumber
  const billTitle = bill?.Title
  const testimonyContent = testimony?.content

  const { profile } = useProfile()
  const senator = useMember(profile?.senator?.id)
  const representative = useMember(profile?.representative?.id)
  const senatorEmail = senator.member?.EmailAddress ?? ""
  const representativeEmail = representative.member?.EmailAddress ?? ""

  const testimonyArchiveEmailAddress = "test@example.com" // in order to have emails send to legislators via BCC, we need a primary "send to" email address for each email.  This is a placeholder email address.  Ultimately, this should be in a configuration file.
  const webSiteBillAddress = siteUrl(`bill?id=${bill.BillNumber}`)
  const [checkedSendToYourLegislators, setCheckedSendToYourLegislators] =
    React.useState(true)
  const [checkedSendToCommittee, setCheckedSendToCommittee] =
    React.useState(committeeName) // only default checkbox to checked if the bill is in a committee
  const [checkedTweet, setCheckedTweet] = React.useState(true)
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

  const emailSuffix = `See more testimony on this bill at ${webSiteBillAddress}`

  const emailCommandToMyLegislators = createMyLegislatorEmailCommand(
    representativeEmail,
    senatorEmail,
    positionWord,
    positionEmailSubject,
    billNumber,
    billTitle,
    testimonyContent,
    emailSuffix,
    testimonyArchiveEmailAddress
  )

  const emailCommandToCommitteeChairs = createCommitteeChairEmailCommand(
    houseChairEmail,
    senateChairEmail,
    committeeName,
    positionWord,
    positionEmailSubject,
    billNumber,
    billTitle,
    testimonyContent,
    emailSuffix,
    testimonyArchiveEmailAddress
  )

  const tweet = encodeURI(
    `https://twitter.com/intent/tweet?text=I provided testimony on bill ${bill.BillNumber}: ${bill.Title}.
    
See ${webSiteBillAddress} for details.`
  )

  // if (checkedSendToYourLegislators) {
  //   window.open(emailCommandToMyLegislators) // allow user to send a formatted email using their email client
  // }
  // if (checkedSendToCommittee && (houseChairEmail || senateChairEmail)) {
  //   window.open(emailCommandToCommitteeChairs) // allow user to send a formatted email using their email client
  // }
  // if (checkedTweet) {
  //   window.open(tweet)
  // }

  const handleClosePostSubmitModal = () => {}

  console.log("showing post submit modal")
  console.log("showPostSubmitModal")
  console.log(showPostSubmitModal)
  // handleCloseTestimony()
  return (
    <Modal show={showPostSubmitModal} onHide={handleClosePostSubmitModal}>
      <Modal.Header closeButton onClick={handleClosePostSubmitModal}>
        <Modal.Title>
          <div>{"Nice job!  Your testimony is saved."}</div>
          <div>
            {"Now share your testimony" +
              (bill ? " on " + bill.BillNumber : "")}
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <>
          <Col className="col-sm align-middle">
            <div>
              <EmailToMyLegislatorsComponent
                checkedSendToYourLegislators={checkedSendToYourLegislators}
                setCheckedSendToYourLegislators={
                  setCheckedSendToYourLegislators
                }
                senator={senator}
                representative={representative}
              />
            </div>
            <div>
              <EmailToCommitteeComponent
                checkedSendToCommittee={checkedSendToCommittee}
                setCheckedSendToCommittee={setCheckedSendToCommittee}
                committeeName={committeeName}
              />
            </div>
            <div>
              <TweetComponent
                checkedTweet={checkedTweet}
                setCheckedTweet={setCheckedTweet}
              />
            </div>
          </Col>
        </>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClosePostSubmitModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )

  // if (!showPostSubmitModal) {
  //   return <></>
  // } else {
  //   return (
  //   )
  // }
}

export default PostSubmitModal
