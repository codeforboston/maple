import React from "react"
import { Table, Container, Button } from "react-bootstrap"
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony"
import { useBill, usePublicProfile } from "../db"
import Link from "next/link"
import { formatBillId } from "../formatting"
import ProfileButton from "../ProfileButton/ProfileButton"
import { overlayTrigger, Tooltip } from "../tooltip"

const TestimonyRow = ({ testimony }) => {
  const { result: bill } = useBill(testimony.billId)

  const profile = usePublicProfile(testimony.authorUid)
  const authorPublic = profile.result?.public

  return (
    <tr>
      <td>
        <Link href={`/bill?id=${testimony.billId}`}>
          {formatBillId(testimony.billId)}
        </Link>
      </td>
      <td>{testimony.position}</td>
      <td>
        {!testimony.authorDisplayName ? (
          <>(blank)</>
        ) : authorPublic ? (
          <ProfileButton
            uid={testimony?.authorUid}
            displayName={testimony?.authorDisplayName}
          />
        ) : (
          <>{testimony.authorDisplayName}</>
        )}
      </td>
      <td>{testimony.publishedAt.toDate().toLocaleString()}</td>
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
            <th>Submitter{overlayTrigger(`some submitters do not have links because _____`)}</th>
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
