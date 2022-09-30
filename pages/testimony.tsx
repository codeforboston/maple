import { useBillTestimony } from "components/db/testimony/useBillTestimony"
import { Internal } from "components/links"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Spinner } from "react-bootstrap"
import styled from "styled-components"
import { Container } from "../components/bootstrap"
import { Testimony, useBill, usePublicProfile } from "../components/db"
import { formatBillId, formatTestimonyDate } from "../components/formatting"
import { createPage } from "../components/page"
import { ViewAttachment } from "../components/ViewAttachment"

const PositionSentence = styled(Container)`
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  font-weight: bold;
`
const TestimonyContainer = styled(Container)`
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
    const [testimony, setTestimony] = useState<Testimony>()
    const { billId, author } = router.query
    const billTestimonyResult = useBillTestimony(
      author as string,
      billId as string
    )
    const { result: bill, loading } = useBill(billId as string)

    const profile = usePublicProfile(author as string)
    const authorPublic = profile.result?.public
    const authorLink = "/profile?id=" + author
    const billLink = "/bill?id=" + bill?.content.BillNumber

    useEffect(() => {
      if (billTestimonyResult.loading) {
        setTestimony(billTestimonyResult.published || billTestimonyResult.draft)
      }
    }, [billTestimonyResult])

    return (
      <Container className="mt-3">
        {testimony ? (
          <>
            <div>
              <h3>
                {bill ? (
                  <Internal href={billLink}>{`${formatBillId(
                    bill.content.BillNumber
                  )}: ${bill.content.Title}`}</Internal>
                ) : loading ? (
                  ""
                ) : (
                  <div>This testimony is not connected to a specific bill</div>
                )}
              </h3>
            </div>

            <div>
              <div className="mt-4">
                {testimony.publishedAt ? (
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
                        formatTestimonyDate(testimony.publishedAt)}
                    </h3>
                  </PositionSentence>
                ) : (
                  <PositionSentence>
                    <h3>This testimony is still in</h3>
                    <h3 style={{ color: "#ff8600" }}>draft</h3>
                  </PositionSentence>
                )}
              </div>

              <div className="mt-4">
                <TestimonyContainer>{testimony.content}</TestimonyContainer>
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
