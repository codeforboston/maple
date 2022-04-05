import React from "react"
import { Table, Container, Button } from "react-bootstrap"
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony"
import { useBill } from "../db"
import { useRouter } from "next/router"

const TestimonyRow = ({ testimony }) => {
  const { result: bill } = useBill(testimony.billId)
  const router = useRouter()

  return (
    <tr>
      <td>
        <Button
          variant="primary"
          onClick={() => router.push(`/bill?id=${testimony.billId}`)}
        >
          {testimony.billId}
        </Button>
      </td>
      <td>{testimony.position}</td>
      <td>
        {testimony.authorDisplayName == null ? (
          "(blank)"
        ) : (
          <Button
            variant="primary"
            onClick={() =>
              router.push(`/publicprofile?id=${testimony.authorUid}`)
            }
          >
            {testimony.authorDisplayName}
          </Button>
        )}
      </td>
      <td>{testimony.publishedAt.toDate().toLocaleString().substring(0, 8)}</td>
      <td>{testimony.content.substring(0, 100)}...</td>
      <td>{testimony.attachment != null ? "Yes" : ""}</td>
      <td>
        <ExpandTestimony bill={bill?.content} testimony={testimony} />
      </td>
    </tr>
  )
}

const TestimoniesTable = ({ testimonies }) => {
  const testimoniesComponent = testimonies.map((testimony, index) => {
    return <TestimonyRow key={index} testimony={testimony} />
  })

  return (
    <Container>
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Bill</th>
            <th>Position</th>
            <th>Submitter</th>
            <th>Date Submitted</th>
            <th>Text</th>
            <th>Attachment?</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{testimoniesComponent}</tbody>
      </Table>
    </Container>
  )
}

export default TestimoniesTable
