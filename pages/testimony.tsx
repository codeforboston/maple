import { useRouter } from "next/router"
import { Button, Spinner } from "react-bootstrap"
import { Container } from "../components/bootstrap"
import {
  useBill,
  usePublicProfile,
  usePublishedTestimonyListing
} from "../components/db"
import { formatBillId } from "../components/formatting"
import { Wrap } from "../components/links"
import { createPage } from "../components/page"
import { ViewAttachment } from "../components/ViewAttachment"

export default createPage({
  title: "Testimony",
  Page: () => {
    const router = useRouter()
    const { billId, author } = router.query
    const {
      items: { result, status }
    } = usePublishedTestimonyListing({
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

    const profile = usePublicProfile(testimony?.authorUid)
    const authorPublic = profile.result?.public
    const authorLink = "/publicprofile?id=" + author

    return (
      <Container className="mt-3">
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
                <b>
                  {authorPublic && (
                    <a href={authorLink}>{testimony.authorDisplayName}</a>
                  )}
                  {!authorPublic && testimony.authorDisplayName}
                  {testimony.position === "neutral"
                    ? " is neutral on "
                    : " " + testimony.position + "d "}
                  {" this "}{" "}
                  <a href={`/bill?id=${bill?.content.BillNumber}`}>bill</a>
                  {" on " + testimony.publishedAt.toDate().toLocaleDateString()}
                </b>
              </div>

              <div style={{ whiteSpace: "pre-wrap" }}>
                <b>Testimony:</b> {testimony.content}
              </div>
              <div className="mt-2">
                <ViewAttachment testimony={testimony} />
              </div>
              <div className="mt-4">
                {authorPublic && (
                  <Wrap href={`/publicprofile?id=${author}`}>
                    <Button variant="primary" className="ms-2">
                      View User Profile
                    </Button>
                  </Wrap>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <Spinner animation="border" className="justify-content-center" />
          </>
        )}
      </Container>
    )
  }
})
