import React, { useCallback, useState } from "react"
import { Table, Container, Button, Spinner } from "react-bootstrap"
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony"
import EditTestimony from "../EditTestimony/EditTestimony"
import ConfirmDeleteTestimony, { DeleteButton } from "../DeleteTestimony/DeleteTestimony"
import { useAuth } from "../../components/auth"
import { useBill, useEditTestimony, usePublishedTestimonyListing } from "../db"
import Link from "next/link"
import { formatBillId } from "../../components/formatting"
import DeleteTestimony from "../DeleteTestimony/DeleteTestimony"

const TestimonyRow = ({ testimony, refreshTable }) => {

  const { result: bill } = useBill(testimony.billId)

  const { user } = useAuth()
  const userIsAuthor = user?.uid == testimony?.authorUid

  const { discardDraft, deleteTestimony } = useEditTestimony(user.uid, testimony.billId)
  const loading = discardDraft.loading || deleteTestimony.loading

  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const handleDeleteClick = () => { setShowConfirmDelete(true) }

  const doDelete = async () => {
    setShowConfirmDelete(false)
    await discardDraft.execute()
    await deleteTestimony.execute()
    console.log("deletion")
    refreshTable()
  }

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
              <>
                <EditTestimony
                  className="ml-2"
                  bill={bill.content}
                  testimony={testimony}
                  refreshTable={refreshTable} />
                &nbsp;
                {loading
                  ? <Spinner animation="border" />
                  : <DeleteButton onclick={handleDeleteClick} />
                }
                <ConfirmDeleteTestimony
                  billNumber={formatBillId(bill.id)}
                  billTitle={bill.content.Title}
                  showConfirmDelete={showConfirmDelete}
                  closeConfirmDelete={() => setShowConfirmDelete(false)}
                  doDelete={doDelete} />
              </>
            )}
          </div>
        </td>
      </tr>
    )
  }
}

const UserTestimonies = ({ authorId }) => {
  const testimoniesResponse = usePublishedTestimonyListing({ uid: authorId })

  const refreshTable = useCallback(() => { testimoniesResponse.execute() }, [testimoniesResponse])

  const { status, result } = testimoniesResponse
  const testimonies = status == "loading" || status == "error"
    ? []
    : result


  const testimoniesComponent = !testimonies
    ? ""
    : testimonies.map((testimony, index) => {
      return <TestimonyRow testimony={testimony} key={index} refreshTable={refreshTable} />
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
