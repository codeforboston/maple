import React from "react"
import { Row, Spinner } from "react-bootstrap"
import AddTestimony from "../AddTestimony/AddTestimony"
import BillCosponsors from "../BillCosponsors/BillCosponsors"
import BillReadMore from "../BillReadMore/BillReadMore"
import BillStatus from "../BillStatus/BillStatus"
import BillTestimonies from "../BillTestimonies/BillTestimonies"
import { useBill, useMember } from "../db"
import { billLink, committeeLink, memberLink } from "../links"

const ViewBillPage = ({ billId }) => {
  const { loading, result: fullBill } = useBill(billId)

  const bill = fullBill?.content

  const { member } = useMember(bill?.PrimarySponsor?.Id)

  const billHistory = fullBill?.history
  const committeeName = fullBill?.currentCommittee?.name
  const houseChairEmail = fullBill?.currentCommittee?.houseChair?.email
  const senateChairEmail = fullBill?.currentCommittee?.senateChair?.email

  return loading ? (
    <Row>
      <Spinner animation="border" className="mx-auto" />
    </Row>
  ) : (
    <>
      <div className="text-center">
        <div className="h4">{billLink(bill)}</div>
        <div>{bill ? bill.Title : ""}</div>
        <div>
          <b>Lead Sponsor: </b>
          {member && memberLink(member)}
        </div>
      </div>
      <Row>
        <div className=" d-flex justify-content-center mt-1">
          <BillCosponsors bill={bill} />
          <BillStatus bill={bill} billHistory={billHistory} />
        </div>
      </Row>
      <div className="text-center">
        <b>Current Committee: </b>
        {committeeLink(fullBill?.currentCommittee)}
      </div>
      <div className="m-3">
        {bill && bill.DocumentText != null ? (
          <>
            <span style={{ whiteSpace: "pre-wrap" }}>
              <i>{bill.DocumentText.substring(0, 350)}&#8288;&#8230;</i>
            </span>
            {bill.DocumentText.length > 350 ? (
              <BillReadMore bill={bill} />
            ) : null}
          </>
        ) : (
          ""
        )}
      </div>
      <h1>Published Testimony</h1>
      <BillTestimonies bill={bill} />
      <AddTestimony
        bill={bill}
        committeeName={committeeName}
        houseChairEmail={houseChairEmail}
        senateChairEmail={senateChairEmail}
      />
    </>
  )
}

export default ViewBillPage
