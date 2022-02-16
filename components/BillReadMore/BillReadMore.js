import React, { useState } from "react"
import { Button, Modal } from 'react-bootstrap'

const BillReadMore = ({ bill }) => {
  const [showAddComment, setShowAddComment] = useState(false);

  const handleShowAddComment = () => setShowAddComment(true);
  const handleCloseAddComment = () => setShowAddComment(false);

    return (
        <>
            <div className="d-flex justify-content-center">
                <Button variant="primary" onClick={handleShowAddComment}>
                    Read More
                </Button>
            </div>

            <Modal show={showAddComment} onHide={handleCloseAddComment} size="lg">
                <Modal.Header closeButton onClick={handleCloseAddComment}>
                    <Modal.Title>{bill ? bill.BillNumber + " - " + bill.Title : ""}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="text-center">
                        <span>{bill.DocumentText}</span>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseAddComment}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default BillReadMore