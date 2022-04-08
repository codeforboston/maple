import React, { useState } from "react"
import { Button, Modal, Table } from "react-bootstrap"
import { useMember } from "../db"
import { memberLink } from "../links"

const CoSponsorRow = ({ coSponsor }) => {
  const url = coSponsor
    ? `https://malegislature.gov/Legislators/Profile/${coSponsor.Id}`
    : ""
  const { member, loading } = useMember(coSponsor.Id)
  if (loading) {
    return null
  } else if (!member) {
    return (
      <tr>
        <td>{coSponsor.Name}</td>
        <td></td>
        <td></td>
      </tr>
    )
  } else {
    return (
      <tr>
        <td>{memberLink(member)}</td>
        <td>{member?.Branch}</td>
        <td>{member?.District}</td>
      </tr>
    )
  }
}

const CoSponsorRows = ({ coSponsors }) => {
  return coSponsors.map((coSponsor, index) => {
    return <CoSponsorRow coSponsor={coSponsor} key={index} />
  })
}

const BillCosponsors = props => {
  const bill = props.bill
  const coSponsors = bill && bill.Cosponsors ? bill.Cosponsors : []
  const numCoSponsors = coSponsors ? coSponsors.length : 0
  const [showBillCosponsors, setShowBillCosponsors] = useState(false)

  const handleShowBillCosponsors = () =>
    numCoSponsors > 0
      ? setShowBillCosponsors(true)
      : setShowBillCosponsors(false)
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
            <Table responsive striped bordered hover>
              <tbody>
                <CoSponsorRows coSponsors={coSponsors} />
              </tbody>
            </Table>
          </>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default BillCosponsors
