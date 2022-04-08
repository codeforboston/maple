import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useRouter } from "next/router"
import React from "react"
import { Button, Container, Row, Spinner, Table } from "react-bootstrap"
import * as links from "../../components/links.tsx"
import { useBills, useMember } from "../db"
import { formatBillId } from "../formatting"
import { Search } from "../search"

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
        <td>{fullBill.nextHearingAt?.toDate().toLocaleDateString()}</td>
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
  const {
    bills,
    setSort,
    setFilter,
    loading,
    nextPage,
    previousPage,
    currentPage,
    hasNextPage,
    hasPreviousPage
  } = useBills()

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
      <div className="d-flex justify-content-center mb-3">
        <Button
          variant="primary"
          style={{ marginRight: 15 }}
          onClick={previousPage}
          disabled={!hasPreviousPage}
        >
          <FontAwesomeIcon icon={faAngleLeft} />
        </Button>
        <span>Page {currentPage}</span>
        <Button
          variant="primary"
          style={{ marginLeft: 15 }}
          onClick={nextPage}
          disabled={!hasNextPage}
        >
          <FontAwesomeIcon icon={faAngleRight} />
        </Button>
      </div>
    </Container>
  )
}

export default ViewBills
