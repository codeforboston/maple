import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where
} from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { useCallback, useState } from "react"
import styled from "styled-components"
import { useAuth } from "../auth"
import { Button, Col, Container, Image, Row, Stack } from "../bootstrap"
import { ProfileHook, useProfile } from "../db"
import { firestore, storage } from "../firebase"
import { TestimonyFormPanel } from "../publish"
import { Back } from "./Back"
import { BillNumber, Styled } from "./BillNumber"
import { BillTestimonies } from "./BillTestimonies"
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
  const billId = bill.id
  const { user } = useAuth()
  const uid = user?.uid
  const actions = useProfile()
  const profile = actions.profile
  const subscriptionRef = collection(firestore, `/users/${uid}/subscriptions/`)

  let userBillList = profile?.billsFollowing ? profile.billsFollowing : []
  // let checkBill = userBillList.map(item => item).includes(billId)

  const [queryResult, setQueryResult] = useState("")

  const billQuery = async () => {
    const q = query(subscriptionRef, where("topicName", "==", `bill-${billId}`))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.data().topicName)
      setQueryResult(doc.data().topicName)
    })
  }

  uid ? billQuery() : console.log("no uid")

  console.log("test", queryResult)

  queryResult ? console.log("matched") : console.log("unmatched")

  // const thing = async () => await getDoc(doc(subscriptionRef, billId))

  // !thing
  //   ? console.log("No such document!")
  //   : console.log("Document data:", thing)

  // const docSnap = async () => {
  //   await getDoc(doc(subscriptionRef, billId))
  // }

  // const getSubscription = () => {
  //   docSnap()
  // }

  // getSubscription()
  // console.log(docSnap)

  // if (docSnap.exists()) {
  //   console.log("Document data:", docSnap.data())
  // } else {
  //   // doc.data() will be undefined in this case
  //   console.log("No such document!")
  // }

  async function updateProfile({ actions }: { actions: ProfileHook }) {
    const { updateBillsFollowing } = actions
    await updateBillsFollowing(userBillList)
  }

  const handleFollowClick = async () => {
    // checkBill ? null : (userBillList = [billId, ...userBillList])
    // await updateProfile({ actions })

    const topic = "bill-"
    const topicName = topic.concat(billId)
    const subscriptionData = {
      user: uid,
      topicName: topicName
    }

    await setDoc(doc(subscriptionRef, billId), {
      user: uid,
      topicName: topicName
    })

    console.log("follow")
    setQueryResult(topicName)
  }

  const handleUnfollowClick = async () => {
    // userBillList = userBillList.filter(item => item !== billId)
    // await updateProfile({ actions })
    await deleteDoc(doc(subscriptionRef, billId))
    setQueryResult("")
    console.log("delete")
  }

  return (
    <StyledContainer className="mt-3 mb-3">
      <Row>
        <Col>
          <Back href="/bills">Back to List of Bills</Back>
        </Col>
      </Row>
      <Row>
        <Col>
          <BillNumber bill={bill} />
        </Col>
        {bill.history.length > 0 ? (
          <Col xs={6} className="d-flex justify-content-end">
            <Status bill={bill} />
          </Col>
        ) : (
          <Col xs={6} className="d-flex justify-content-end">
            <Styled>
              <Button
                className={`btn btn-primary btn-sm ms-auto py-2
                ${uid ? "" : "visually-hidden"}
              `}
                onClick={queryResult ? handleUnfollowClick : handleFollowClick}
              >
                {queryResult ? "Following" : "Follow"}
                {queryResult ? (
                  <StyledImage src="/check-white.svg" alt="checkmark" />
                ) : null}
              </Button>
            </Styled>
          </Col>
        )}
      </Row>
      {bill.history.length > 0 ? (
        <>
          <Row className="mb-4">
            <Col xs={12} className="d-flex justify-content-end">
              <Button
                className={`btn btn-primary btn-sm ms-auto py-2 w-auto
                ${uid ? "" : "visually-hidden"}
              `}
                onClick={queryResult ? handleUnfollowClick : handleFollowClick}
              >
                {queryResult ? "Following" : "Follow"}
                {queryResult ? (
                  <StyledImage src="/check-white.svg" alt="checkmark" />
                ) : null}
              </Button>
            </Col>
          </Row>
        </>
      ) : null}
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
        </Col>
      </Row>
    </StyledContainer>
  )
}
