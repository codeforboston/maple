import React, { useState } from "react"
import { Button, Modal } from "react-bootstrap"
import CommentModal from "../CommentModal/CommentModal"

export const EditTestimonyButton = props => {
  return (
    <Button variant="primary" onClick={props.onclick}>
      Edit
    </Button>
  )
}

const EditTestimony = props => {
  const { bill, showEditTestimony, setShowEditTestimony, refreshtable } = props
  const testimony = props.testimony

  const handleShowTestimony = () => setShowEditTestimony(true)
  const handleCloseTestimony = () => {
    setShowEditTestimony(false)
    refreshtable()
  }
  return (
    <>
      <CommentModal
        bill={bill}
        showTestimony={showEditTestimony}
        setShowTestimony={setShowEditTestimony}
        handleShowTestimony={handleShowTestimony}
        handleCloseTestimony={handleCloseTestimony}
        testimony={testimony}
      />
    </>
  )
}

export default EditTestimony
