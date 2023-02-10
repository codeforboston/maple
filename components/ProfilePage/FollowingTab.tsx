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
  const subscriptionRef = collection(firestore, `/users/${uid}/subscriptions/`)
  let billList: string[] = []
  const [unfollowModal, setUnfollowModal] = useState<"show" | null>(null)
  const [currentBill, setCurrentBill] = useState<string>("")
  const [billsFollowing, setBillsFollowing] = useState<string[]>([])

  const close = () => setUnfollowModal(null)

  const handleUnfollowClick = async (billId: string) => {
    await deleteDoc(doc(subscriptionRef, billId))

    setBillsFollowing([])
    setUnfollowModal(null)
  }

  const billsFollowingQuery = async () => {
    const q = query(subscriptionRef, where("user", "==", `${uid}`))
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
                  href={`https://malegislature.gov/Bills/${element.court}/${element.bill}`}
                >
                  {formatBillId(element.bill)}
                </External>
                <Row>
                  <Col className={`col-10`}>
                    <BillFollowingTitle
                      court={element.court}
                      id={element.bill}
                    />
                  </Col>
                  <Col
                    className={`text-center`}
                    onClick={() => {
                      setUnfollowModal("show")
                      setCurrentBill(element.bill)
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
        handleUnfollowClick={handleUnfollowClick}
        onHide={close}
        onUnfollowModalClose={() => setUnfollowModal(null)}
        show={unfollowModal === "show"}
      />
    </>
  )
}
