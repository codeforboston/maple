import {
  collection,
  deleteDoc,
  doc,
  query,
  where,
  getDocs
} from "firebase/firestore"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { useAuth } from "../auth"
import { Col, Row, Stack } from "../bootstrap"
import { firestore } from "../firebase"
import { formatBillId } from "../formatting"
import { External } from "../links"
import { TitledSectionCard } from "../shared"
import BillFollowingTitle from "./BillFollowingTitle"
import UnfollowModal from "./UnfollowModal"

type Props = {
  className?: string
}

export const Styled = styled.div`
  font-size: 2rem;
  a {
    display: inline-flex;
    align-items: baseline;

    font-family: "Nunito";
    font-style: normal;
    font-weight: 600;
    font-size: 25px;
    line-height: 125%;

    text-decoration-line: underline;
  }
  svg {
    max-height: 2rem;
    max-height: 2rem;
  }
`

export function FollowingTab({ className }: Props) {
  const { user } = useAuth()
  const uid = user?.uid
  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/activeTopicSubcriptions/`
  )
  let billList: string[] = []
  const [billsFollowing, setBillsFollowing] = useState<string[]>([])
  const [currentBill, setCurrentBill] = useState<string>("")
  const [currentCourt, setCurrentCourt] = useState<number>(0)
  const [unfollowModal, setUnfollowModal] = useState<"show" | null>(null)

  const close = () => setUnfollowModal(null)

  const handleUnfollowClick = async (billId: string, courtId: number) => {
    const topicName = "bill-"
      .concat(courtId.toString())
      .concat("-")
      .concat(billId)
    await deleteDoc(doc(subscriptionRef, topicName))

    setBillsFollowing([])
    setUnfollowModal(null)
  }

  const billsFollowingQuery = async () => {
    const q = query(subscriptionRef, where("uid", "==", `${uid}`))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      billList.push(doc.data().billLookup)
    })

    if (billsFollowing.length === 0 && billList.length != 0) {
      setBillsFollowing(billList)
    }
  }

  useEffect(() => {
    uid ? billsFollowingQuery() : null
  })

  return (
    <>
      <TitledSectionCard className={className}>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
          <Stack>
            <h2>Bills You Follow</h2>
            {billsFollowing.map((element: any) => (
              <Styled key={element}>
                <External
                  href={`https://malegislature.gov/Bills/${element.court}/${element.billId}`}
                >
                  {formatBillId(element.billId)}
                </External>
                <Row>
                  <Col className={`col-10`}>
                    <BillFollowingTitle
                      court={element.court}
                      id={element.billId}
                    />
                  </Col>
                  <Col
                    className={`text-center`}
                    onClick={() => {
                      setUnfollowModal("show")
                      setCurrentBill(element.billId)
                      setCurrentCourt(element.court)
                    }}
                  >
                    <button
                      className={`btn btn-link d-flex align-items-start p-0 text-decoration-none`}
                    >
                      <h6>Unfollow</h6>
                    </button>
                  </Col>
                  <hr className={`mt-3`} />
                </Row>
              </Styled>
            ))}
          </Stack>
        </div>
      </TitledSectionCard>
      <TitledSectionCard className={`${className} invisible`}>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
          <Stack>
            <h2>Organizations You Follow</h2>
          </Stack>
        </div>
      </TitledSectionCard>
      <UnfollowModal
        currentBill={currentBill}
        currentCourt={currentCourt}
        handleUnfollowClick={handleUnfollowClick}
        onHide={close}
        onUnfollowModalClose={() => setUnfollowModal(null)}
        show={unfollowModal === "show"}
      />
    </>
  )
}
