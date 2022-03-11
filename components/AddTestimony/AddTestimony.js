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
                {authenticated ? "Add your voice" : "Sign in to add your voice"}
            </Button>
        </div>
      
        {authenticated && 
            <CommentModal
                bill={bill}
                showTestimony={showTestimony}
                setShowTestimony={setShowTestimony}
                handleShowTestimony={handleShowTestimony}
                handleCloseTestimony={handleCloseTestimony}
            />
        }
    </>
    )
}

export default AddTestimony
