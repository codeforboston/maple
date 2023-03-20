import React, { useState } from "react"
import { Button, Modal, Table } from "react-bootstrap"
import styled from "styled-components"
import { MemberReference, useMember } from "../db"
import { memberLink } from "../links"
import { FC } from "../types"
import { BillProps } from "./types"

const CoSponsorRow = ({
  court,
  coSponsor
}: {
  court: number
  coSponsor: MemberReference
}) => {
  const url = coSponsor
    ? `https://malegislature.gov/Legislators/Profile/${coSponsor.Id}`
    : ""
  const { member, loading } = useMember(court, coSponsor.Id)
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

const CoSponsorRows = ({
  court,
  coSponsors
}: {
  court: number
  coSponsors: MemberReference[]
}) => {
  return (
    <>
      {coSponsors.map((coSponsor, index) => {
        return <CoSponsorRow court={court} coSponsor={coSponsor} key={index} />
      })}
    </>
  )
}

const StyledButton = styled(Button)`
  :focus {
    box-shadow: none;
  }
  padding: 0;
  margin: 0;
`

export const Cosponsors: FC<BillProps> = ({ bill, children }) => {
  const billNumber = bill.id
  const court = bill.court
  const coSponsors = bill.content.Cosponsors
  const numCoSponsors = coSponsors ? coSponsors.length : 0
  const [showBillCosponsors, setShowBillCosponsors] = useState(false)

  const handleShowBillCosponsors = () =>
    numCoSponsors > 0
      ? setShowBillCosponsors(true)
      : setShowBillCosponsors(false)
  const handleCloseBillCosponsors = () => setShowBillCosponsors(false)

  return (
    <>
      <StyledButton
        variant="link"
        className="m-1 text-dark"
        onClick={handleShowBillCosponsors}
      >
        {children}
      </StyledButton>
      <Modal
        show={showBillCosponsors}
        onHide={handleCloseBillCosponsors}
        size="lg"
      >
        <Modal.Header closeButton onClick={handleCloseBillCosponsors}>
          <Modal.Title>{billNumber + " CoSponsors"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <Table responsive striped bordered hover>
              <tbody>
                <CoSponsorRows court={court} coSponsors={coSponsors} />
              </tbody>
            </Table>
          </>
        </Modal.Body>
      </Modal>
    </>
  )
}
