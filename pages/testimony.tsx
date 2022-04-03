import { createPage } from "../components/page"
import {
  getBill,
  useBill,
  usePublishedTestimonyListing
} from "../components/db"
import { useRouter } from "next/router"
import { Spinner } from "react-bootstrap"
import { formatBillId } from "../components/formatting"

export default createPage({
  v2: true,
  title: "Testimony",
  Page: () => {
    const router = useRouter()
    const { billId, author } = router.query
    const { result, status } = usePublishedTestimonyListing({
      uid: author as string,
      billId: billId as string
    })
    const testimony =
      status in ["loading", "error"]
        ? undefined
        : result && result?.length > 0
        ? result[0]
        : undefined

    const { result: bill, loading, error } = useBill(billId as string)

    return (
      <>
        {testimony ? (
          <>
            {bill ? (
              <h1>{`${formatBillId(bill.content.BillNumber)}: ${
                bill.content.Title
              }`}</h1>
            ) : (
              <div>This testimony is not connected to a specific bill</div>
            )}
            <div className="m-auto">
              <div>
                <b>Author:</b> {testimony.authorDisplayName}
              </div>
              <div>
                <b>Date Published:</b>{" "}
                {testimony.publishedAt.toDate().toLocaleString()}
              </div>
              <div>
                <b>Position:</b>{" "}
                <span className="text-capitalize">{testimony.position}</span>
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>
                <b>Testimony:</b> {testimony.content}
              </div>
              <div>
                <b>Attachements:</b> None
              </div>
            </div>
          </>
        ) : (
          <>
            <Spinner animation="border" className="justify-content-center" />
          </>
        )}
      </>
    )
  }
})
