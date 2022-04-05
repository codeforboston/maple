import React from "react"
import { Row, Spinner } from "react-bootstrap"
import BillTestimonies from "../BillTestimonies/BillTestimonies"
import AddTestimony from "../AddTestimony/AddTestimony"
import BillCosponsors from "../BillCosponsors/BillCosponsors"
import BillStatus from "../BillStatus/BillStatus"
import BillReadMore from "../BillReadMore/BillReadMore"
import { useBill } from "../db"

const ViewBillPage = ({ billId }) => {
  const { loading, result: fullBill } = useBill(billId)

  const bill = fullBill?.content
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
        <h1>{bill ? bill.BillNumber : ""}</h1>
        <h4>{bill?.Title ? bill?.Title : bill?.Pinslip}</h4>
        <div className="font-italic">
          Lead Sponsor: {bill?.PrimarySponsor.Name}{" "}
        </div>
        <Row className="mt-2 mb-2">
          <div className=" d-flex justify-content-center">
            <BillCosponsors bill={bill} />
            <BillStatus bill={bill} billHistory={billHistory} />
          </div>
        </Row>
        <h5>{committeeName ? "Current Committee: " + committeeName : ""}</h5>
      </div>
      <div>
        {bill && bill.DocumentText != null ? (
          <>
            <span style={{ whiteSpace: "pre-wrap" }}>
              {bill.DocumentText.substring(0, 700) + "..."}
            </span>
            {bill.DocumentText.length > 700 ? (
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
