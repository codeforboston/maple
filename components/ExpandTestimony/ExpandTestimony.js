import copy from "copy-to-clipboard"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { Button, Modal } from "react-bootstrap"
import { siteUrl, Wrap } from "../links"

const getDirectLink = testimony => {
  const { billId, authorUid } = testimony

  return siteUrl(`testimony?billId=${billId}&author=${authorUid}`)
}

const ExpandTestimony = props => {
  const bill = props.bill
  const testimony = props.testimony
  const router = useRouter()

  const [showTestimony, setShowTestimony] = useState(false)

  const handleShowTestimony = () => {
    setShowTestimony(true)
  }
  const handleCloseTestimony = () => {
    setShowTestimony(false)
  }
  return (
    <>
      <Button variant="primary" onClick={handleShowTestimony}>
        Expand
      </Button>
      <Modal show={showTestimony} onHide={handleCloseTestimony} size="lg">
        <Modal.Header closeButton onClick={handleCloseTestimony}>
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
                testimony.publishedAt.toDate().toLocaleString() +
                " - " +
                testimony.position
              : ""}
          </h4>
          <p style={{ whiteSpace: "pre-wrap" }}>
            {testimony ? testimony.content : ""}
          </p>
          <h4>
            {testimony && testimony.attachment != null ? (
              <Button variant="primary">See attachment</Button>
            ) : (
              ""
            )}
          </h4>
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
    </>
  )
}

export default ExpandTestimony
