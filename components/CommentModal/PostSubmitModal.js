import React from "react"
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
  handleCloseTestimony,
  bill,
  testimony,
  senateChairEmail,
  houseChairEmail,
  committeeName,
  refreshtable
}) => {
  const billNumber = bill?.BillNumber
  const billTitle = bill?.Title
  const testimonyContent = testimony?.content

  const { profile } = useProfile()

  const senator = useMember(profile?.senator?.id)
  const representative = useMember(profile?.representative?.id)

  const senatorEmail = senator.member?.EmailAddress ?? ""
  const representativeEmail = representative.member?.EmailAddress ?? ""

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
    emailSuffix
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
    emailSuffix
  )

  const tweetURL = encodeURI(
    `https://twitter.com/intent/tweet?text=I provided testimony on bill ${
      bill.BillNumber
    }${bill.Title.length > 174 ? "" : ": " + bill.Title.trim()}.
    See ${webSiteBillAddress} for details.`
  )

  const handleClosePostSubmitModal = () => {
    setShowPostSubmitModal(false)
    refreshtable()
  }

  return (
    <Modal
      show={showPostSubmitModal}
      onShow={handleCloseTestimony}
      onHide={handleClosePostSubmitModal}
      backdrop="static"
    >
      <Modal.Header>
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
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default PostSubmitModal
