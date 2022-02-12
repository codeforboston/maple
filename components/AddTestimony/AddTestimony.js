import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'

const AddTestimony = (props) => {
  const bill = props.bill
  const [showAddComment, setShowAddComment] = useState(false);

  const handleShowAddComment = () => setShowAddComment(true);
  const handleCloseAddComment = () => setShowAddComment(false);

    return (
  <>
      <div className="d-flex justify-content-center">
        <Button variant="primary" onClick={handleShowAddComment}>
          Add your voice
        </Button>
      </div>
      
      <Modal show={showAddComment} onHide={handleCloseAddComment} size="lg">
        <Modal.Header closeButton onClick={handleCloseAddComment}>
            <Modal.Title>{bill ? bill.BillNumber + " - " + bill.Title : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="text-center">
              <select className="form-control">
                <option>Endorse</option>
                <option>Oppose</option>
                <option>Neutral</option>
              </select>

              <textarea className="form-control mt-2" rows="20" placeholder="My comments on this bill" required></textarea>
            </div>
          </>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handleShowAddComment}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
    )
}

export default AddTestimony