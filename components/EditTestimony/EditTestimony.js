import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'
import CommentModal from "../CommentModal/CommentModal"

const EditTestimony = (props) => {
  const bill = props.bill
  const testimony = props.testimony
  const [showTestimony, setShowTestimony] = useState(false);

  const handleShowTestimony = () => setShowTestimony(true);
  const handleCloseTestimony = () => setShowTestimony(false);
  return (
  <>
    <Button variant="primary" onClick={handleShowTestimony}>
      Edit
    </Button>
    <CommentModal
      bill={bill}
      showTestimony={showTestimony}
      setShowTestimony={setShowTestimony}
      handleShowTestimony={handleShowTestimony}
      handleCloseTestimony={handleCloseTestimony}
      testimony={testimony}
    />
  </>
  )
}

export default EditTestimony