import Link from "next/link"
import React, { useCallback, useState } from "react"
import { useAuth } from "../../components/auth"
import { Container, Spinner, Table } from "../../components/bootstrap"
import { formatBillId } from "../../components/formatting"
import { TableButton } from "../buttons"
import { useBill, useEditTestimony, usePublishedTestimonyListing } from "../db"
import ConfirmDeleteTestimony from "../DeleteTestimony/DeleteTestimony"
import EditTestimony from "../EditTestimony/EditTestimony"
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony"

const TestimonyRow = ({ testimony, refreshtable }) => {
  const { result: bill } = useBill(testimony.billId)

  const { user } = useAuth()
  const userIsAuthor = user?.uid == testimony?.authorUid

  const { discardDraft, deleteTestimony } = useEditTestimony(
    user.uid,
    testimony.billId
  )
  const loading = discardDraft.loading || deleteTestimony.loading

  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const handleDeleteClick = () => {
    setShowConfirmDelete(true)
  }
  const doDelete = useCallback(async () => {
    setShowConfirmDelete(false)
    await discardDraft.execute()
    await deleteTestimony.execute()
    console.log("deletion")
    refreshtable()
  }, [deleteTestimony, discardDraft, refreshtable])

  const [showEditTestimony, setShowEditTestimony] = useState(false)
  const handleEditTestimonyClick = () => {
    !showEditTestimony && setShowEditTestimony(true)
  }

  const [showTestimony, setShowTestimony] = useState(false)

  const handleShowTestimony = () => {
    setShowTestimony(true)
  }
  const closeTestimony = () => {
    setShowTestimony(false)
  }

  if (!bill) {
    return null
  } else {
    return (
      <>
        {loading ? (
          <tr className="w-100 m-2">
            <td colSpan={5}>
              <div className="d-flex justify-content-center w-100">
                <Spinner animation="border" />
              </div>
            </td>
          </tr>
        ) : (
          <tr>
            <td>{testimony.position}</td>
            <td>
              <Link href={`/bill?id=${testimony.billId}`}>
                {formatBillId(testimony.billId)}
              </Link>
            </td>
            <td>{testimony.publishedAt.toDate().toLocaleDateString()}</td>
            <td>{testimony.content.substring(0, 100)}...</td>
            <td className="flex-row justify-content-evenly">
              <TableButton onclick={handleShowTestimony}>Expand</TableButton>
              {userIsAuthor && (
                <>
                  <TableButton onclick={handleEditTestimonyClick}>
                    Edit
                  </TableButton>
                  <TableButton onclick={handleDeleteClick}>Delete </TableButton>
                </>
              )}
              <>
                <ExpandTestimony
                  bill={bill.content}
                  testimony={testimony}
                  showTestimony={showTestimony}
                  setShowTestimony={setShowTestimony}
                />
                <EditTestimony
                  bill={bill.content}
                  testimony={testimony}
                  showEditTestimony={showEditTestimony}
                  setShowEditTestimony={setShowEditTestimony}
                  refreshtable={refreshtable}
                />
                <ConfirmDeleteTestimony
                  billNumber={formatBillId(bill.id)}
                  billTitle={bill.content.Title}
                  showConfirmDelete={showConfirmDelete}
                  closeConfirmDelete={() => setShowConfirmDelete(false)}
                  doDelete={doDelete}
                />
              </>
            </td>
          </tr>
        )}
      </>
    )
  }
}

const UserTestimonies = ({ authorId }) => {
  const testimoniesResponse = usePublishedTestimonyListing({ uid: authorId })

  const refreshTable = useCallback(() => {
    testimoniesResponse.execute()
  }, [testimoniesResponse])

  const { status, result } = testimoniesResponse
  const testimonies = status == "loading" || status == "error" ? [] : result

  const testimoniesComponent = !testimonies
    ? ""
    : testimonies.map((testimony, index) => {
        return (
          <TestimonyRow
            testimony={testimony}
            key={index}
            refreshtable={refreshTable}
          />
        )
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
