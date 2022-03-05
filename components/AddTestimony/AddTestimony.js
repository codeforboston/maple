import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'
import { useAuth } from "../../components/auth"
import { useProfile, useMember } from "../db"
import * as links from "../../components/links"

const publishTestimony = (props) => {
    console.log("publishing..")
    // save to Firebase
}

const CommentModal = (props) => {
    const bill=props.bill
    const showAddComment=props.showAddComment
    const setShowAddComment=props.setShowAddComment
    const handleCloseAddComment = () => setShowAddComment(false);
    
    const { profile } = useProfile()
    const representativeId = profile ? profile.representative.id : null
    const senatorId = profile ? profile.senator.id : null
    const { member } = useMember(senatorId)
    const senatorEmail =  member ? member.EmailAddress : null
    // console.log(senatorEmail)
    const { member2 } = useMember(representativeId)
    // console.log(member2 ? member2.EmailAddress : null)
    const url = `mailto:${senatorEmail}?subject=Testimony on Bill ${bill ? bill.BillNumber : ""}`
    
    return (
     <Modal show={showAddComment} onHide={handleCloseAddComment} size="lg">
        <Modal.Header closeButton onClick={handleCloseAddComment}>
            <Modal.Title>{"Add Your Testimony" + (bill ? " for " + bill.BillNumber + " - " + bill.Title : "")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <table className="center" border="0" width="100%">
                <tbody>
                    <tr>
                        <td>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className="text-center">
                                                <select className="form-control">
                                                    <option value="DEFAULT">Select my support..</option>
                                                    <option value="Endorse">Endorse</option>
                                                    <option value="Oppose">Oppose</option>
                                                    <option value="Neutral">Neutral</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><div className="form-check">
                                            <input className="form-check-input" type="checkbox" value="" id="flexCheckChecked"/>
                                            <label className="form-check-label" htmlFor="flexCheckChecked">
                                                Anonymous
                                            </label>
                                        </div></td>
                                    </tr>
                                    {/* <tr>
                                        <td><div className="form-check">
                                            <input className="form-check-input" type="checkbox" value="" id="flexCheckChecked"/>
                                            <label className="form-check-label" htmlFor="flexCheckChecked">
                                                Send copy to your legislatures
                                            </label>
                                        </div></td>
                                    </tr> */}
                                    {/* <td><div className="form-check">
                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckChecked"/>
                                        <label className="form-check-label" htmlFor="flexCheckChecked">
                                            Send copy to relevant committee
                                        </label>
                                    </div></td> */}
                                    <tr>
                                        <links.External href={url}>
                                            Send copy to your legislators
                                        </links.External>
                                    </tr>
                                        <links.External href={url}>
                                            Send copy to relevant committee
                                        </links.External>
                                    <tr>
                                    </tr>
                                </tbody>
                            </table>
                            </td>
                        <td width="400px">
                            <textarea className="form-control" resize="none" rows="20" placeholder="My comments on this bill" required></textarea>
                            <Button className="mt-2">Upload a document</Button>
                        </td>
                        <td width="50px"/>

                    </tr>
                </tbody>
            </table>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={publishTestimony}>
                Publish
            </Button>
        </Modal.Footer>
    </Modal>
    )
} 
   
const AddTestimony = (props) => {
  const bill = props.bill
  const [showAddComment, setShowAddComment] = useState(false);
  const handleShowAddComment = () => setShowAddComment(true);
  const { authenticated, user } = useAuth()
    return (
  <>
        <div className="d-flex justify-content-center">
            <Button variant="primary" onClick={handleShowAddComment}>
                {authenticated ? "Add your voice" : "Login to add your voice"}
            </Button>
        </div>
      
        {/* to force authentication to add comments, add "authenticated &&" in front of modal call below */}
        <CommentModal
            bill={bill}
            showAddComment={showAddComment}
            setShowAddComment={setShowAddComment}
            handleShowAddComment={handleShowAddComment}
        />
    </>
    )
}

export default AddTestimony
