import React, {useState} from "react";
import { Form, Button, Row, Modal } from 'react-bootstrap'

const AddTestimony = (props) => {
  const bill = props.bill
  const [showAddComment, setShowAddComment] = useState(false);

  const handleShowAddComment = () => setShowAddComment(true);
  const handleCloseAddComment = () => setShowAddComment(false);

    return (
  <>
      <div className="d-flex justify-content-center">
        <Button variant="primary" onClick={handleShowAddComment}>
          Add your voice
        </Button>
      </div>
      
      <Modal show={showAddComment} onHide={handleCloseAddComment} size="lg">
        <Modal.Header closeButton onClick={handleCloseAddComment}>
            <Modal.Title>{"Add Your Testimony" + (bill ? " for " + bill.BillNumber + " - " + bill.Title : "")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <table class="center" border="0" width="100%">
                <tbody>
                    <tr>
                        <td>
                            <table>
                                <tbody>
                                    <tr>
                                        <div className="text-center">
                                            <select className="form-control">
                                                <option value="DEFAULT">Select my support..</option>
                                                <option value="Endorse">Endorse</option>
                                                <option value="Oppose">Oppose</option>
                                                <option value="Neutral">Neutral</option>
                                            </select>
                                        </div>
                                    </tr>
                                    <tr>
                                        <td><div class="form-check">
                                            <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked/>
                                            <label class="form-check-label" for="flexCheckChecked">
                                                Anonymous
                                            </label>
                                        </div></td>
                                    </tr>
                                    <tr>
                                        <td><div class="form-check">
                                            <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked/>
                                            <label class="form-check-label" for="flexCheckChecked">
                                                Send copy to your legislatures
                                            </label>
                                        </div></td>
                                    </tr>
                                    <tr>
                                        <td><div class="form-check">
                                            <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked/>
                                            <label class="form-check-label" for="flexCheckChecked">
                                                Send copy to relevant committee:
                                            </label>
                                        </div></td>
                                    </tr>
                                </tbody>
                            </table>
                            </td>
                        <td width="400px">
                            <textarea className="form-control" resize="none" rows="20" placeholder="My comments on this bill" required></textarea>
                        </td>
                        <td width="50px"/>

                    </tr>
                </tbody>
            </table>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={handleShowAddComment}>
                Publish
            </Button>
        </Modal.Footer>
      </Modal>
    </>
    )
}

export default AddTestimony