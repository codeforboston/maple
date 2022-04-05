import { createPage } from "../components/page"
import {
  getBill,
  useBill,
  usePublishedTestimonyListing
} from "../components/db"
import { useRouter } from "next/router"
import { Spinner, Button } from "react-bootstrap"
import { formatBillId } from "../components/formatting"
import { Wrap } from "../components/links"

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

    const { result: bill, loading } = useBill(billId as string)

    return (
      <>
        {testimony ? (
          <>
            {bill ? (
              <h1>{`${formatBillId(bill.content.BillNumber)}: ${
                bill.content.Title
              }`}</h1>
            ) : loading ? (
              ""
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
              <div className="mt-4">
                <Wrap href={`/bill?id=${bill?.content.BillNumber}`}>
                  <Button variant="primary" className="ms-2">
                    View Bill
                  </Button>
                </Wrap>
                <Wrap href={`/publicprofile?id=${author}`}>
                  <Button variant="primary" className="ms-2">
                    View User Profile
                  </Button>
                </Wrap>
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
