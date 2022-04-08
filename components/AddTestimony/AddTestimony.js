import React, { useEffect, useState } from "react"
import { Button, Modal } from "react-bootstrap"
import { useAuth } from "../../components/auth"
import CommentModal from "../CommentModal/CommentModal"
import { usePublishedTestimonyListing } from "../db"
import { useRouter } from "next/router"

const AddTestimony = ({
  bill,
  committeeName,
  houseChairEmail,
  senateChairEmail
}) => {
  const [showTestimony, setShowTestimony] = useState(false)

  const router = useRouter()

  const handleShowTestimony = () => {
    if (!authenticated) {
      router.push({ pathname: "/login", query: { r: router.asPath } })
    } else {
      setShowTestimony(true)
    }
  }

  const handleCloseTestimony = () => setShowTestimony(false)
  const { authenticated, user } = useAuth()

  const published = usePublishedTestimonyListing({ uid: user?.uid })
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    const userTestimonies = published?.result?.filter(
      u => u.authorUid === user?.uid && bill.BillNumber === u.billId
    )

    setIsPublished(userTestimonies?.length !== 0)
  }, [bill.BillNumber, published?.result, user?.uid])

  return (
    <>
      <div className="d-flex justify-content-center">
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
        />
      )}
    </>
  )
}

export default AddTestimony
