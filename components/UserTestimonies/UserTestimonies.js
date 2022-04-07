import React from "react"
import { Table, Container, Button } from "react-bootstrap"
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony"
import EditTestimony from "../EditTestimony/EditTestimony"
import DeleteTestimony from "../DeleteTestimony/DeleteTestimony"
import { useAuth } from "../../components/auth"
import { useBill, usePublishedTestimonyListing } from "../db"
import Link from "next/link"
import { formatBillId } from "../../components/formatting"

const TestimonyRow = ({ testimony }) => {
  const { result: bill } = useBill(testimony.billId)
  const { user } = useAuth()
  const userIsAuthor = user?.uid == testimony?.authorUid

  if (!bill) {
    return null
  } else {
    return (
      <tr>
        <td>{testimony.position}</td>
        <td>
          <Link href={`/bill?id=${testimony.billId}`}>
            {formatBillId(testimony.billId)}
          </Link>
        </td>
        <td>{testimony.publishedAt.toDate().toLocaleDateString()}</td>
        <td>{testimony.content.substring(0, 100)}...</td>
        <td>
          <div className="d-flex">
            <ExpandTestimony bill={bill.content} testimony={testimony} />
            &nbsp;
            {userIsAuthor && (
              <EditTestimony
                className="ml-2"
                bill={bill.content}
                testimony={testimony}
              />
            )}
            &nbsp;
            {userIsAuthor && (
              <DeleteTestimony bill={bill.content} testimony={testimony} />
            )}
          </div>
        </td>
      </tr>
    )
  }
}

const UserTestimonies = ({ authorId }) => {
  const testimoniesResponse = usePublishedTestimonyListing({ uid: authorId })
  const testimonies =
    testimoniesResponse.status == "loading" ||
    testimoniesResponse.status == "error"
      ? []
      : testimoniesResponse.result
  const testimoniesComponent = !testimonies
    ? ""
    : testimonies.map((testimony, index) => {
        return <TestimonyRow testimony={testimony} key={index} />
      })

  return (
    <Container>
      <h1>Testimonies </h1>
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Position</th>
            <th>Bill #</th>
            <th>Date Submitted</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>{testimoniesComponent}</tbody>
      </Table>
    </Container>
  )
}

export default UserTestimonies
