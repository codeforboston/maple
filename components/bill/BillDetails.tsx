import { flags } from "components/featureFlags"
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where
} from "firebase/firestore"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { useAuth } from "../auth"
import { Button, Col, Container, Image, Row } from "../bootstrap"
import { firestore } from "../firebase"
import { TestimonyFormPanel } from "../publish"
import { Back } from "./Back"
import { BillNumber, Styled } from "./BillNumber"
import { BillTestimonies } from "./BillTestimonies"
import BillTrackerConnectedView from "./BillTracker"
import { Committees, Hearing, Sponsors } from "./SponsorsAndCommittees"
import { Status } from "./Status"
import { Summary } from "./Summary"
import { BillProps } from "./types"

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

const StyledImage = styled(Image)`
  width: 14.77px;
  height: 12.66px;

  margin-left: 8px;
`

export const BillDetails = ({ bill }: BillProps) => {
  return (
    <StyledContainer className="mt-3 mb-3">
      <Row>
        <Col>
          <Back href="/bills">Back to List of Bills</Back>
        </Col>
      </Row>
      {bill.history.length > 0 ? (
        <>
          <Row>
            <Col>
              <BillNumber bill={bill} />
            </Col>
            <Col xs={6} className="d-flex justify-content-end">
              <Status bill={bill} />
            </Col>
          </Row>
          <Row className="mb-4">
            <Col xs={12} className="d-flex justify-content-end">
              <FollowButton bill={bill} />
            </Col>
          </Row>
        </>
      ) : (
        <Row>
          <Col>
            <BillNumber bill={bill} />
          </Col>
          <Col xs={6} className="d-flex justify-content-end">
            <Styled>
              <FollowButton bill={bill} />
            </Styled>
          </Col>
        </Row>
      )}
      <Row className="mt-2">
        <Col>
          <Summary bill={bill} />
        </Col>
      </Row>
      <Row>
        <Col md={8}>
          <Sponsors bill={bill} className="mt-4 pb-1" />
          <BillTestimonies bill={bill} className="mt-4" />
        </Col>
        <Col md={4}>
          <Committees bill={bill} className="mt-4 pb-1" />
          <Hearing
            bill={bill}
            className="bg-secondary d-flex justify-content-center mt-4 pb-1 text-light"
          />
          <TestimonyFormPanel bill={bill} />
          {flags().billTracker && (
            <BillTrackerConnectedView bill={bill} className="mt-4" />
          )}
        </Col>
      </Row>
    </StyledContainer>
  )
}

const FollowButton = ({ bill }: BillProps) => {
  const billId = bill.id
  const courtId = bill.court
  const topicName = `bill-${courtId}-${billId}`
  const { user } = useAuth()
  const uid = user?.uid
  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/activeTopicSubscriptions/`
  )
  const [queryResult, setQueryResult] = useState("")

  const billQuery = async () => {
    const q = query(
      subscriptionRef,
      where("topicName", "==", `bill-${courtId}-${billId}`)
    )
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      setQueryResult(doc.data().topicName)
    })
  }

  useEffect(() => {
    uid ? billQuery() : null
  })

  const handleFollowClick = async () => {
    await setDoc(doc(subscriptionRef, topicName), {
      topicName: topicName,
      uid: uid,
      billLookup: {
        billId: billId,
        court: courtId
      },
      type: "bill"
    })

    setQueryResult(topicName)
  }

  const handleUnfollowClick = async () => {
    await deleteDoc(doc(subscriptionRef, topicName))

    setQueryResult("")
  }

  return (
    <Button
      className={`btn btn-primary btn-sm ms-auto py-1 w-auto ${
        uid ? "" : "visually-hidden"
      }`}
      onClick={queryResult ? handleUnfollowClick : handleFollowClick}
    >
      {queryResult ? "Following" : "Follow"}
      {queryResult ? (
        <StyledImage src="/check-white.svg" alt="checkmark" />
      ) : null}
    </Button>
  )
}
