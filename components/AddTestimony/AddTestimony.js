import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'
import { useAuth } from "../../components/auth"
import CommentModal from "../CommentModal/CommentModal"
   
const AddTestimony = (props) => {
  const bill = props.bill
  const [showTestimony, setShowTestimony] = useState(false);

  const handleShowTestimony = () => setShowTestimony(true);
  const handleCloseTestimony = () => setShowTestimony(false);
  const { authenticated, user } = useAuth()
    return (
  <>
        <div className="d-flex justify-content-center">
            <Button variant="primary" onClick={handleShowTestimony}>
                {authenticated ? "Add your voice" : "Login to add your voice"}
            </Button>
        </div>
      
        {/* to force authentication to add comments, add "authenticated &&" in front of modal call below */}
        <CommentModal
            bill={bill}
            showTestimony={showTestimony}
            setShowTestimony={setShowTestimony}
            handleShowTestimony={handleShowTestimony}
            handleCloseTestimony={handleCloseTestimony}
        />
    </>
    )
}

export default AddTestimony
