import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { Button } from "react-bootstrap"
import { useAuth } from "../../components/auth"
import CommentModal from "../CommentModal/CommentModal"
import { usePublishedTestimonyListing } from "../db"

const AddTestimony = ({ bill, refreshtable }) => {
  const [showTestimony, setShowTestimony] = useState(false)

  const router = useRouter()

  const committeeName = bill?.currentCommittee?.name,
    houseChairEmail = bill?.houseChair?.email,
    senateChairEmail = bill?.senateChair?.email

  const handleShowTestimony = () => {
    if (!authenticated) {
      router.push({ pathname: "/login", query: { r: router.asPath } })
    } else {
      setShowTestimony(true)
    }
  }

  const handleCloseTestimony = () => {
    setShowTestimony(false)
  }
  const { authenticated, user } = useAuth()

  const { items } = usePublishedTestimonyListing({ uid: user?.uid })
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    const userTestimonies = items.result?.filter(
      u => u.authorUid === user?.uid && bill.BillNumber === u.billId
    )

    setIsPublished(userTestimonies?.length !== 0)
  }, [bill.BillNumber, items.result, user?.uid])

  return (
    <>
      <div className="d-flex justify-content-center pb-3">
        <Button variant="primary" onClick={handleShowTestimony}>
          {!authenticated
            ? "Sign in to add your voice"
            : isPublished
            ? "Edit your testimony"
            : "Add your testimony"}
        </Button>
      </div>

      {authenticated && (
        <CommentModal
          bill={bill}
          showTestimony={showTestimony}
          setShowTestimony={setShowTestimony}
          handleShowTestimony={handleShowTestimony}
          handleCloseTestimony={handleCloseTestimony}
          committeeName={committeeName}
          houseChairEmail={houseChairEmail}
          senateChairEmail={senateChairEmail}
          refreshtable={refreshtable}
        />
      )}
    </>
  )
}

export default AddTestimony
