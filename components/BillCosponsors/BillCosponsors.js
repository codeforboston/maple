import React, {useState} from "react";
import { Button, Modal, Table, NavLink } from 'react-bootstrap'

const CoSponsorRows = ({ coSponsors }) => {
  return coSponsors.map((coSponsor, index) => {
    const url = coSponsor ? `https://malegislature.gov/Legislators/Profile/${coSponsor.Id}` : ""
    return (
      <tr key={index}>
        <td>{coSponsor.Name}</td>
        <td><NavLink href={url} target="_blank" rel="noreferrer">Link</NavLink></td>
      </tr>
    )
  })
}

const BillCosponsors = (props) => {
  const bill = props.bill
  const coSponsors = bill?.Cosponsors ?? []
  const [showBillCosponsors, setShowBillCosponsors] = useState(false)

  const handleShowBillCosponsors = () => setShowBillCosponsors(true)
  const handleCloseBillCosponsors = () => setShowBillCosponsors(false)

  return (
    <>
      <Button
        variant="primary"
        className="m-1"
        onClick={handleShowBillCosponsors}
      >
        Cosponsors
      </Button>
      <Modal
        show={showBillCosponsors}
        onHide={handleCloseBillCosponsors}
        size="lg"
      >
        <Modal.Header closeButton onClick={handleCloseBillCosponsors}>
          <Modal.Title>
            {bill ? bill.BillNumber + " CoSponsors" : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <Table striped bordered hover>
              <tbody><CoSponsorRows coSponsors={coSponsors}/></tbody>
            </Table>
          </>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default BillCosponsors
