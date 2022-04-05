import React from "react"
import { Table, Container, Button } from "react-bootstrap"
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony"
import { useBill, useMember } from "../db"
import { useRouter } from "next/router"

const MemberName = ({ memberId }) => {
  const { member, loading } = useMember(memberId)
  return <>{member?.Name}</>
}

const TestimonyRow = ({ testimony }) => {
  const { result: bill } = useBill(testimony.billId)
  const router = useRouter()
  const senatorId = testimony.senatorId
  const representativeId = testimony.representativeId

  return (
    <tr>
      <td>{testimony.billId}</td>
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
      <td>
        <MemberName memberId={senatorId} />
      </td>
      <td>
        <MemberName memberId={representativeId} />
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
            <th>Submitter Senator</th>
            <th>Submitter Representative</th>
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
