import React, {useState} from "react";
import { Button, Modal, Table, NavLink } from 'react-bootstrap'

const CoSponsorRows = ({ coSponsors }) => {
  return coSponsors.map((coSponsor, index) => {
    const url = coSponsor ? `https://malegislature.gov/Legislators/Profile/${coSponsor.Id}` : ""
    return (
      <tr key={index}>
        <td><NavLink href={url} target="_blank" rel="noreferrer">{coSponsor.Name}</NavLink></td>
      </tr>
    )
  })
} 

const BillCosponsors = (props) => {
  const bill = props.bill
  const coSponsors = bill && bill.Cosponsors ? bill.Cosponsors : []
  const numCoSponsors = coSponsors ? coSponsors.length : 0
  const [showBillCosponsors, setShowBillCosponsors] = useState(false)

  const handleShowBillCosponsors = () => numCoSponsors > 0 ? setShowBillCosponsors(true) : setShowBillCosponsors(false)
  const handleCloseBillCosponsors = () => setShowBillCosponsors(false)

  return (
    <>
      <Button
        variant="primary"
        className="m-1"
        onClick={handleShowBillCosponsors}
      >
        Cosponsors {numCoSponsors}
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
