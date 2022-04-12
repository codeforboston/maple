import React, { useState } from "react"
import { TableButton } from "../buttons"
import CommentModal from "../CommentModal/CommentModal"


const EditTestimony = props => {
  const { bill, refreshtable } = props

  const [showEditTestimony, setShowEditTestimony] = useState(false)

  const handleEditTestimonyClick = () => {
    !showEditTestimony && setShowEditTestimony(true)
  }

  const handleCloseTestimony = () => {
    showEditTestimony && setShowEditTestimony(false)
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
        handleCloseTestimony={handleCloseTestimony}
        refreshtable={refreshtable}
      />
    </>
  )
}

export default EditTestimony
