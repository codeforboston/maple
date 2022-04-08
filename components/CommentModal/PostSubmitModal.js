import React, { useEffect, useState } from "react"
import { siteUrl } from "../links"
import { Button, Col, Modal } from "../bootstrap"
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

  const emailToMyLegislatorsURL = createMyLegislatorEmailCommand(
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

  const emailToCommitteeChairsURL = createCommitteeChairEmailCommand(
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

  const tweetURL = encodeURI(
    `https://twitter.com/intent/tweet?text=I provided testimony on bill ${bill.BillNumber}: ${bill.Title}.
    
See ${webSiteBillAddress} for details.`
  )

  const handleClosePostSubmitModal = () => {}

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
                emailToMyLegislatorsURL={emailToMyLegislatorsURL}
                senator={senator}
                representative={representative}
              />
            </div>
            <div>
              <EmailToCommitteeComponent
                emailToCommitteeChairsURL={emailToCommitteeChairsURL}
              />
            </div>
            <div>
              <TweetComponent tweetURL={tweetURL} />
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
}

export default PostSubmitModal
