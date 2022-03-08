import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'
import { useEditTestimony } from "../db/testimony/useEditTestimony"
import { useAuth } from "../../components/auth"

const DeleteTestimony = (props) => {
  const bill = props.bill
  const [showTestimony, setShowTestimony] = useState(false);
  const { user, authenticated } = useAuth()
  const handleShowTestimony = () => setShowTestimony(true);
  const handleCloseTestimony = () => setShowTestimony(false);

  const edit = useEditTestimony(user.uid, bill.BillNumber)

  const deleteTestimony = async () => {
    await edit.discardDraft.execute()
    await edit.deleteTestimony.execute()
  }

  return (
  <>
    <Button variant="primary" onClick={handleShowTestimony}>
      Delete
    </Button>
    <Modal show={showTestimony} onHide={handleCloseTestimony} size="lg">
      <Modal.Header closeButton onClick={handleCloseTestimony}>
        <Modal.Title>{bill ? bill.BillNumber + " - " + bill.Title : ""}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete your testimony for this bill?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={deleteTestimony}>
            Delete
        </Button>
        <Button>
            Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  </>
  )
}

export default DeleteTestimony