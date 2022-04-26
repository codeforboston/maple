import Link from "next/link"
import React from "react"
import { Container, Table } from "react-bootstrap"
import {
  Testimony,
  useBill,
  usePublicProfile,
  UsePublishedTestimonyListing
} from "../db"
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony"
import { formatBillId } from "../formatting"
import ProfileButton from "../ProfileButton/ProfileButton"
import { TestimonySearch } from "../search"
import { PaginationButtons } from "../table"
import { QuestionTooltip } from "../tooltip"

const TestimoniesTable = (
  props: UsePublishedTestimonyListing & { search?: boolean }
) => {
  const { pagination, items, setFilter } = props
  const testimonies = items.result ?? []
  return (
    <Container>
      {props.search && <TestimonySearch setFilter={setFilter} />}
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Bill</th>
            <th>Position</th>
            <th>
              Submitter
              <QuestionTooltip text="Submitters without links have chosen to make their profile private." />
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
