import React, { useState } from "react"
import { TableButton } from "../buttons"
import CommentModal from "../CommentModal/CommentModal"


const EditTestimony = props => {
  const { bill, refreshtable } = props

  const [showEditTestimony, setShowEditTestimony] = useState(false)

  const handleEditTestimonyClick = () => {
    !showEditTestimony && setShowEditTestimony(true)
  }

  const handleShowTestimony = () => setShowEditTestimony(true)
  const handleCloseTestimony = () => {
    setShowEditTestimony(false)
    refreshtable()
  }
  return (
    <>
      <TableButton onclick={handleEditTestimonyClick}>
        Edit
      </TableButton>
      <CommentModal
        bill={bill}
        showTestimony={showEditTestimony}
        setShowTestimony={setShowEditTestimony}
        handleShowTestimony={handleShowTestimony}
        handleCloseTestimony={handleCloseTestimony}
      />
    </>
  )
}

export default EditTestimony
