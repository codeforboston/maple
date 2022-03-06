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
    <Modal show={showTestimony} onHide={handleCloseTestimony} size="lg">
        <CommentModal
            bill={bill}
            showAddComment={showTestimony}
            setShowTestimony={setShowTestimony}
            handleShowTestimony={handleShowTestimony}
        />
    </Modal>
  </>
  )
}

export default EditTestimony