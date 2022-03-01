import React, {useState} from "react";
import { Button, Modal, Table } from 'react-bootstrap'
import { documentHistoryActions } from "../MockAPIResponseDocumentHistoryActions";

const DocumentHistoryActionRows = () => {
  return (
    documentHistoryActions.map((documentHistoryAction, index) => {
      return (
        <tr key={index}>
          <td>{documentHistoryAction.Date.substring(0,10)}</td>
          <td>{documentHistoryAction.Date.substring(11,19)}</td>
          <td>{documentHistoryAction.Branch}</td>
          <td>{documentHistoryAction.Action}</td>
        </tr>
      )
    }) 
  )
}

const BillHistory = (props) => {
  const bill = props.bill
  const [showBillHistory, setShowBillHistory] = useState(false);

  const handleShowBillHistory = () => setShowBillHistory(true);
  const handleCloseBillHistory = () => setShowBillHistory(false);

  return (
    <>
      <Button variant="primary" className="m-1" onClick={handleShowBillHistory}>
        History
      </Button>
      <Modal show={showBillHistory} onHide={handleCloseBillHistory} size="lg">
        <Modal.Header closeButton onClick={handleCloseBillHistory}>
            <Modal.Title>{bill ? bill.BillNumber + " - " + bill.Title : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
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
                  <DocumentHistoryActionRows/>
                </tbody>
              </Table>
            </div>
          </>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default BillHistory