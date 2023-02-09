import { useCallback, useEffect, useMemo, useState } from "react"
import styled from "styled-components"
import { Col, Image, Row, Stack } from "../bootstrap"
import { Profile, ProfileHook } from "../db"
import { formatBillId } from "../formatting"
// import { billLink, billURL, External } from "../links"
import { externalBillLink, External } from "../links"
import { TitledSectionCard } from "../shared"
import BillFollowingTitle from "./BillFollowingTitle"
import { ImageInput } from "./ImageInput"
import UnfollowModal from "./UnfollowModal"

import {
  collection,
  deleteDoc,
  doc,
  query,
  where,
  getDocs
} from "firebase/firestore"
import { firestore, storage } from "../firebase"
import { Frequency, useAuth } from "../auth"
import {
  currentGeneralCourt,
  parseApiDateTime
} from "../../functions/src/malegislature"
import { db } from "../../functions/src/firebase"

type Props = {
  actions: ProfileHook
  className?: string
  profile: Profile
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
    /* or 31px */

    text-decoration-line: underline;
  }
  svg {
    max-height: 2rem;
    max-height: 2rem;
  }
`

export function FollowingTab({ actions, className, profile }: Props) {
  const [unfollowModal, setUnfollowModal] = useState<"show" | null>(null)
  const [currentBill, setCurrentBill] = useState<string>("")
  const [billsFollowing, setBillsFollowing] = useState<string[]>([])

  const close = () => setUnfollowModal(null)

  async function updateProfile({ actions }: { actions: ProfileHook }) {
    const { updateBillsFollowing } = actions
    await updateBillsFollowing(userBillList)
  }

  const handleUnfollowClick = async (billId: string) => {
    // userBillList = userBillList.filter(item => item !== billId)
    // await updateProfile({ actions })
    await deleteDoc(doc(subscriptionRef, billId))

    setUnfollowModal(null)
  }

  let userBillList = profile?.billsFollowing ? profile.billsFollowing : []

  const { user } = useAuth()
  const uid = user?.uid
  const subscriptionRef = collection(firestore, `/users/${uid}/subscriptions/`)

  let billList = []

  const billsFollowingQuery = async () => {
    const q = query(subscriptionRef, where("user", "==", `${uid}`))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.data().billLookup)
      billList.push(doc.data().billLookup)
    })
    console.log("final bill list: ", billList)
    console.log(billsFollowing)

    if (billsFollowing.length === 0 && billList.length != 0) {
      setBillsFollowing(billList)
    } else {
      console.log("full", billsFollowing)
    }
  }

  useEffect(() => {
    uid ? billsFollowingQuery() : console.log("no uid")
  })

  return (
    <>
      <TitledSectionCard className={className}>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
          <Stack>
            <h2>Bills You Follow</h2>
            {billsFollowing.map(element => (
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

/*
  Individual Bill --> Pages             --> [ ] red headers get replaced by blue restyled headers
                  --> Following Buttons --> [ ] remove bill number, add check icon when following
*/
