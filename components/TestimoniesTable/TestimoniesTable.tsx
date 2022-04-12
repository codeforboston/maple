import Link from "next/link"
import React from "react"
import { Table, Container } from "react-bootstrap"
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony"
import {
  Testimony,
  useBill,
  usePublicProfile,
  usePublishedTestimonyListing
} from "../db"
import { formatBillId } from "../formatting"
import ProfileButton from "../ProfileButton/ProfileButton"
import { QuestionTooltip } from "../tooltip"
import { PaginationButtons } from "../table"
import { TestimonySearch } from "../search"

const TestimoniesTable = () => {
  const { pagination, items, setFilter } = usePublishedTestimonyListing({})
  const testimonies = items.result ?? []
  console.log(testimonies)
  return (
    <Container>
      <TestimonySearch setFilter={setFilter} />
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Bill</th>
            <th>Position</th>
            <th>
              Submitter
              <QuestionTooltip text="submitters without links have chosen to make their profile private" />
            </th>
            <th>Date Submitted</th>
            <th>Text</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {testimonies.map((testimony, index) => (
            <TestimonyRow key={index} testimony={testimony} />
          ))}
        </tbody>
      </Table>
      <PaginationButtons pagination={pagination} />
    </Container>
  )
}

const TestimonyRow = ({ testimony }: { testimony: Testimony }) => {
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
      <td>{testimony.publishedAt.toDate().toLocaleDateString()}</td>
      <td>{testimony.content.substring(0, 100)}...</td>
      <td>
        <ExpandTestimony bill={bill?.content} testimony={testimony} />
      </td>
    </tr>
  )
}

export default TestimoniesTable
