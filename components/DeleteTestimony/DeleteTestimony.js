import React from "react"
import { Button, Modal } from "react-bootstrap"


export const DeleteButton = (props) => {
  const { onclick } = props
  return <Button variant="primary" onClick={onclick}>
    Delete
  </Button>
}


const ConfirmDeleteTestimony = props => {
  const {
    billNumber,
    billTitle,
    closeConfirmDelete,
    showConfirmDelete,
    doDelete } = props


  return (
    <Modal show={showConfirmDelete} onHide={closeConfirmDelete} size="lg">
      <Modal.Header closeButton onClick={closeConfirmDelete}>
        <Modal.Title>
          {billNumber} {billTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete your testimony for this bill?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={doDelete}>
          Delete
        </Button>
        <Button onClick={closeConfirmDelete}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmDeleteTestimony
