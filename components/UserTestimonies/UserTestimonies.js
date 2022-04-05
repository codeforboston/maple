import React from "react"
import { Table, Container, Button } from "react-bootstrap"
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony"
import EditTestimony from "../EditTestimony/EditTestimony"
import DeleteTestimony from "../DeleteTestimony/DeleteTestimony"
import { useAuth } from "../../components/auth"
import { useBill, usePublishedTestimonyListing } from "../db"
import { useRouter } from "next/router"

const TestimonyRow = ({ testimony }) => {
  const { result: bill } = useBill(testimony.billId)
  const router = useRouter()
  const { user, authenticated } = useAuth()
  const userUid = user ? user.uid : null
  const userIsAuthor = user?.uid == testimony?.authorUid

  if (!bill) {
    return null
  } else {
    return (
      <tr>
        <td>{testimony.position}</td>
        <td>
          <Button
            variant="primary"
            onClick={() => router.push(`/bill?id=${testimony.billId}`)}
          >
            {testimony.billId}
          </Button>
        </td>
        <td>
          {testimony.publishedAt.toDate().toLocaleString().substring(0, 8)}
        </td>
        <td>{testimony.content.substring(0, 100)}...</td>
        <td>{testimony.attachment != null ? "Yes" : ""}</td>
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
            <th>Attachment?</th>
          </tr>
        </thead>
        <tbody>{testimoniesComponent}</tbody>
      </Table>
    </Container>
  )
}

export default UserTestimonies
