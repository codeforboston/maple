import React from "react"
import { Table, Container } from "react-bootstrap"
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony"
import { useBill } from "../db"

const TestimonyRow = ({ testimony }) => {
  const { result: bill } = useBill(testimony.billId)
  return (
    <tr>
      <td>{testimony.position}</td>
      <td>
        {testimony.authorDisplayName == null
          ? "(blank)"
          : testimony.authorDisplayName}
      </td>
      <td>{testimony.publishedAt.toDate().toLocaleString()}</td>
      <td>{testimony.content.substring(0, 100)}...</td>
      <td>{testimony.senatorId}</td>
      <td>{testimony.representativeId}</td>
      <td>{testimony.attachment != null ? "Yes" : ""}</td>
      <td>
        <ExpandTestimony bill={bill?.content} testimony={testimony} />
      </td>
    </tr>
  )
}

const TestimonyTable = ({ testimonies }) => {
  const testimoniesComponent = testimonies.map((testimony, index) => {
    return <TestimonyRow key={index} testimony={testimony} />
  })

  return (
    <Container>
      <h1>Submitted testimonies </h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Support</th>
            <th>Submitter</th>
            <th>Date Submitted</th>
            <th>Text</th>
            <th>Senator</th>
            <th>Representative</th>
            <th>Attachment?</th>
          </tr>
        </thead>
        <tbody>{testimoniesComponent}</tbody>
      </Table>
    </Container>
  )
}

export default TestimonyTable
