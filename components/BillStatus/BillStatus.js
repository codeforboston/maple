import React, {useState} from "react";
import { Button, Modal, Table } from 'react-bootstrap'
import { documentHistoryActions } from "../MockAPIResponseDocumentHistoryActions";

const BillStatus = (props) => {
  const bill = props.bill
  const [showBillStatus, setShowBillStatus] = useState(false);

  const handleShowBillStatus = () => setShowBillStatus(true);
  const handleCloseBillStatus = () => setShowBillStatus(false);

  const currentDocumentAction = documentHistoryActions[documentHistoryActions.length - 1]

    return (
  <>
      <Button variant="primary" className="m-1" onClick={handleShowBillStatus}>
        Status
      </Button>
      <Modal show={showBillStatus} onHide={handleCloseBillStatus} size="lg">
        <Modal.Header closeButton onClick={handleCloseBillStatus}>
            <Modal.Title>{bill ? bill.BillNumber : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="text-center">
              Bill Status
            </div>
            <div className="text-center">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th></th>
                    <th></th>
                    <th>Branch</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{currentDocumentAction.Date.substring(0,10)}</td>
                    <td>{currentDocumentAction.Date.substring(11,19)}</td>
                    <td>{currentDocumentAction.Branch}</td>
                    <td>{currentDocumentAction.Action}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </>
        </Modal.Body>
      </Modal>
    </>
    )
}

export default BillStatus