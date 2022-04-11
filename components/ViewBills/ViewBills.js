import { useRouter } from "next/router"
import React from "react"
import { Button, Container, Row, Spinner, Table } from "react-bootstrap"
import * as links from "../../components/links.tsx"
import { useBills, useMember } from "../db"
import { formatBillId, formatHearingDate } from "../formatting"
import { Search } from "../search"
import { PaginationButtons } from "../table"

const invalidSponsorId = Id => {
  // we will have to learn more about why certain sponsors have invalid ID's
  return ["GOV7"].includes(Id)
}

const BillRow = props => {
  const fullBill = props.bill
  const bill = props.bill.content
  const router = useRouter()
  const { member, loading } = useMember(
    bill.PrimarySponsor ? bill.PrimarySponsor.Id : null
  )
  const sponsorURL =
    bill &&
    bill.PrimarySponsor &&
    bill.PrimarySponsor.Id &&
    !invalidSponsorId(bill.PrimarySponsor.Id)
      ? `https://malegislature.gov/Legislators/Profile/${bill.PrimarySponsor.Id}/Biography`
      : ""
  const numCoSponsors = bill.Cosponsors ? bill.Cosponsors.length : 0

  const SponsorComponent =
    sponsorURL != "" ? (
      <>
        <links.External href={sponsorURL}>
          {bill.PrimarySponsor.Name}
        </links.External>
        - {member?.Branch} - {member?.District}
      </>
    ) : (
      <>{bill.PrimarySponsor ? bill.PrimarySponsor.Name : null}</>
    )

  const committeeCell = fullBill.currentCommittee ? (
    <>
      <links.External
        href={`https://malegislature.gov/Committees/Detail/${fullBill.currentCommittee?.id}/Committees`}
      >
        {fullBill.currentCommittee?.name}
      </links.External>
    </>
  ) : (
    <></>
  )

  if (loading) {
    return null
  } else {
    return (
      <tr>
        <td>
          <Button
            variant="primary"
            onClick={() => router.push(`/bill?id=${bill.BillNumber}`)}
          >
            {formatBillId(bill.BillNumber)}
          </Button>
        </td>
        <td>{bill.Title}</td>
        <td>{SponsorComponent}</td>
        <td>{fullBill.city}</td>
        <td>{numCoSponsors}</td>
        <td>{formatHearingDate(fullBill.nextHearingAt)}</td>
        <td>{fullBill.testimonyCount}</td>
        <td>
          {fullBill.latestTestimonyAt &&
            fullBill.latestTestimonyAt.toDate().toLocaleDateString()}
        </td>
        <td>{committeeCell}</td>
      </tr>
    )
  }
}

const BillRows = ({ bills }) => {
  return bills.map((bill, index) => {
    return <BillRow bill={bill} key={index} />
  })
}

const ViewBills = () => {
  const { bills, setSort, setFilter, loading, ...pagination } = useBills()

  return (
    <Container>
      <Search setSort={setSort} setFilter={setFilter} />
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Bill #</th>
            <th>Bill Name</th>
            <th>Lead Sponsor</th>
            <th>City</th>
            <th># CoSponsors</th>
            <th>Hearing Scheduled</th>
            <th>Published Testimony (#)</th>
            <th>Most Recent Testimony</th>
            <th>Current Committee</th>
          </tr>
        </thead>
        <tbody>{bills && <BillRows bills={bills} />}</tbody>
      </Table>
      <Row>{loading && <Spinner animation="border" className="mx-auto" />}</Row>
      <PaginationButtons pagination={pagination} />
    </Container>
  )
}

export default ViewBills
