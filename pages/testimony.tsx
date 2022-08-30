import { useRouter } from "next/router"
import { Spinner } from "react-bootstrap"
import styled from "styled-components"
import { Container } from "../components/bootstrap"
import {
  useBill,
  usePublicProfile,
  usePublishedTestimonyListing
} from "../components/db"
import { formatBillId } from "../components/formatting"
import { createPage } from "../components/page"
import { ViewAttachment } from "../components/ViewAttachment"

const PositionSentence = styled(Container)`
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  font-weight: bold;
`
const Testimony = styled(Container)`
  white-space: pre-wrap;
  font-family: "Nunito";
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  background-repeat: no-repeat;
  background-size: 4rem;
  background-position: 0.5rem 0.5rem;
`

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
    const billLink = "/bill?id=" + bill?.content.BillNumber

    return (
      <Container className="mt-3">
        {testimony ? (
          <>
            <div>
              <h3>
                {bill ? (
                  <a href={billLink}>{`${formatBillId(
                    bill.content.BillNumber
                  )}: ${bill.content.Title}`}</a>
                ) : loading ? (
                  ""
                ) : (
                  <div>This testimony is not connected to a specific bill</div>
                )}
              </h3>
            </div>

            <div>
              <div className="mt-4">
                <PositionSentence>
                  <h3>
                    {authorPublic && (
                      <a href={authorLink}>{testimony.authorDisplayName}</a>
                    )}
                    {!authorPublic && testimony.authorDisplayName}
                    <span style={{ color: "#FF8600" }}>
                      {testimony.position === "neutral"
                        ? " is neutral on "
                        : " " + testimony.position + "d "}
                    </span>
                    {" this bill on " +
                      testimony.publishedAt.toDate().toLocaleDateString()}
                  </h3>
                </PositionSentence>
              </div>

              <div className="mt-4">
                <Testimony>{testimony.content}</Testimony>
              </div>

              <div className="mt-2">
                <ViewAttachment testimony={testimony} />
              </div>

              <div className="mt-4"></div>
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
