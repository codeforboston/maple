import { Container } from "components/bootstrap"
import { formatBillId } from "components/formatting"
import { Internal } from "components/links"
import { ViewAttachment } from "components/ViewAttachment"
import { FC } from "react"
import { Spinner } from "react-bootstrap"
import styled from "styled-components"
import { PageData } from "./testimonyDetailSlice"

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

export const TestimonyDetailPage: FC<PageData> = ({
  bill,
  testimony,
  author
}) => {
  const authorTitle = author ? (
    <a href={`/profile?id=${author.uid}`}>{testimony.authorDisplayName}</a>
  ) : (
    testimony.authorDisplayName
  )

  const billLink = (
    <Internal href={`/bill?id=${bill.content.BillNumber}`}>{`${formatBillId(
      bill.content.BillNumber
    )}: ${bill.content.Title}`}</Internal>
  )

  return (
    <Container className="mt-3">
      {testimony ? (
        <>
          <div>
            <h3>{billLink}</h3>
          </div>

          <div>
            <div className="mt-4">
              <PositionSentence>
                <h3>
                  {authorTitle}
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
