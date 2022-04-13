import Link from "next/link"
import React, { useCallback } from "react"
import { useAuth } from "../../components/auth"
import { Container, Table } from "../../components/bootstrap"
import { formatBillId } from "../../components/formatting"
import { useBill, usePublishedTestimonyListing } from "../db"
import DeleteTestimony from "../DeleteTestimony/DeleteTestimony"
import EditTestimony from "../EditTestimony/EditTestimony"
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony"

const TestimonyRow = ({ testimony, refreshtable }) => {
  const { result: bill } = useBill(testimony.billId)

  const { user } = useAuth()

  const userIsAuthor = user?.uid == testimony?.authorUid


  if (!bill) {
    return null
  } else {
    return (
      <>
        <tr>
          <td>{testimony.position}</td>
          <td>
            <Link href={`/bill?id=${testimony.billId}`}>
              {formatBillId(testimony.billId)}
            </Link>
          </td>
          <td>{testimony.publishedAt.toDate().toLocaleDateString()}</td>
          <td>{testimony.content.substring(0, 100)}...</td>
          <td className="d-flex flex-nowrap justify-content-evenly">
            <>
              <ExpandTestimony
                bill={bill}
                testimony={testimony}
              />
              {userIsAuthor && <>
                <EditTestimony
                  bill={bill}
                  testimony={testimony}
                  refreshtable={refreshtable}
                />
                <DeleteTestimony
                  bill={bill}
                  testimony={testimony}
                  refreshtable={refreshtable}
                />
              </>}
            </>
          </td>
        </tr>
      </>
    )
  }
}

const UserTestimonies = ({ authorId }) => {
  const testimoniesResponse = usePublishedTestimonyListing({ uid: authorId })

  const refreshtable = useCallback(() => {
    testimoniesResponse.items.execute()
  }, [testimoniesResponse])

  const { status, result } = testimoniesResponse.items
  const testimonies = status == "loading" || status == "error" ? [] : result

  const testimonyRows = testimonies.map((testimony) => {
    return testimony ? (
      <TestimonyRow
        testimony={testimony}
        key={authorId + testimony.billId}
        refreshtable={refreshtable}
      />
    ) :
      (null)
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
        <tbody>{testimonies && testimonyRows}</tbody>
      </Table>
    </Container>
  )
}

export default UserTestimonies
