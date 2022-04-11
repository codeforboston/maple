import copy from "copy-to-clipboard"
import React from "react"
import { Button, Modal } from "react-bootstrap"
import { siteUrl, Wrap } from "../links"
import { ViewAttachment } from "../ViewAttachment"

const getDirectLink = testimony => {
  const { billId, authorUid } = testimony

  return siteUrl(`testimony?billId=${billId}&author=${authorUid}`)
}

const ExpandTestimony = props => {
  const { bill, testimony, showTestimony, closeTestimony } = props

  return (
    <Modal show={showTestimony} onHide={closeTestimony} size="lg">
      <Modal.Header closeButton onClick={closeTestimony}>
        <Modal.Title>
          {bill ? bill.BillNumber + " - " + bill.Title : ""}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>
          {testimony
            ? (testimony.authorDisplayName == null
                ? "Test"
                : testimony.authorDisplayName) +
              " - " +
              testimony.publishedAt.toDate().toLocaleDateString() +
              " - " +
              testimony.position
            : ""}
        </h4>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {testimony ? testimony.content : ""}
        </p>
        <p>
          <ViewAttachment testimony={testimony} />
        </p>
        <Wrap href={getDirectLink(testimony)}>
          <Button variant="primary">See full page</Button>
        </Wrap>
        <Button
          variant="primary"
          className="ms-2"
          onClick={() => {
            copy(getDirectLink(testimony))
          }}
        >
          Copy Link
        </Button>
      </Modal.Body>
    </Modal>
  )
}

export default ExpandTestimony
