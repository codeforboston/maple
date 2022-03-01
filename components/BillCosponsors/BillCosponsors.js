import React, {useState} from "react";
import { Button, Modal, Table } from 'react-bootstrap'
import * as links from "../../components/links.tsx"
import { useMember } from "../db";

const CoSponsorRow = ({coSponsor}) => {
  const url = coSponsor ? `https://malegislature.gov/Legislators/Profile/${coSponsor.Id}` : ""
  const {member, loading} = useMember(coSponsor.Id)
  if (loading) {
    return null
  } else {
    return (
        <tr>
          <td>
            <links.External href={url}>
                {coSponsor.Name}
              </links.External>
          </td>
          <td>{member.Branch}</td>
          <td>{member.District}</td>
          <td>{member.Party}</td>
        </tr>
    )
  }
}

const CoSponsorRows = ({ coSponsors }) => {
  return coSponsors.map((coSponsor, index) => {
    return (
      <CoSponsorRow
        coSponsor = {coSponsor}
        key = {index}
      />
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
