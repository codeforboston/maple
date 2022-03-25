import React, { useState } from "react"
import { Modal, Button } from "react-bootstrap"
import Tweet from "../Tweet/Tweet"

const TweetModal = ({ bill, testimony, showTweetModal, setShowTweetModal }) => {
  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  return (
    <Modal.Dialog show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Tweet that you provided testimony</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>Twitter logo</p>
      </Modal.Body>
    </Modal.Dialog>
    //   <Modal show={showTweetModal} onHide={handleCloseTweetModal} size="lg">
    //     test
    //     <Modal.Body>
    //       <>Tweet your testimony?</>
    //     </Modal.Body>
    //   </Modal>
  )
}

export default TweetModal
