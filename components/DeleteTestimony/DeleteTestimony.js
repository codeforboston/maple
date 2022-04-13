import React, { useState, useCallback } from "react"
import { Button, Modal, Spinner } from "../bootstrap"
import { TableButton } from "../buttons"
import { FormattedBillTitle } from "../formatting"
import { useEditTestimony } from "../db"

const DeleteTestimony = props => {
  const {
    bill,
    testimony,
    refreshtable
  } = props

  const { authorUid, billId } = testimony


  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const handleDeleteClick = () => { setShowConfirmDelete(true) }
  const closeConfirmDelete = () => setShowConfirmDelete(false)

  const { discardDraft, deleteTestimony } = useEditTestimony(
    authorUid,
    billId
  )
  const loading = discardDraft.loading || deleteTestimony.loading


  const doDelete = useCallback(async () => {
    setShowConfirmDelete(false)
    await discardDraft.execute()
    await deleteTestimony.execute()
    refreshtable()
  }, [deleteTestimony, discardDraft, refreshtable])


  return (
    <>
      {loading
        ?
        <div className="d-flex justify-content-center w-100">
          <Spinner animation="border" />
        </div>
        : <TableButton onclick={handleDeleteClick}>Delete</TableButton>}
      <Modal show={showConfirmDelete} onHide={closeConfirmDelete} size="lg">
        <Modal.Header closeButton onClick={closeConfirmDelete}>
          <Modal.Title>
            <FormattedBillTitle bill={bill} />
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
    </>
  )
}

export default DeleteTestimony
