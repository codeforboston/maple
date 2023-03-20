import {
  collection,
  deleteDoc,
  doc,
  query,
  where,
  getDocs
} from "firebase/firestore"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import styled from "styled-components"
import { useAuth } from "../auth"
import { Alert, Col, Row, Spinner, Stack } from "../bootstrap"
import { useBill, usePublicProfile } from "../db"
import { firestore } from "../firebase"
import { formatBillId } from "../formatting"
import { External, Internal } from "../links"
import { TitledSectionCard } from "../shared"
import { OrgIconSmall } from "./StyledEditProfileCompnents"
import UnfollowModal from "./UnfollowModal"

type Props = {
  className?: string
}

export type UnfollowModalConfig = {
  court: number
  orgName: string
  type: string
  typeId: string
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
    `/users/${uid}/activeTopicSubscriptions/`
  )
  const [unfollow, setUnfollow] = useState<UnfollowModalConfig | null>(null)
  const close = () => setUnfollow(null)

  let billList: string[] = []
  const [billsFollowing, setBillsFollowing] = useState<string[]>([])
  let orgsList: string[] = []
  const [orgsFollowing, setOrgsFollowing] = useState<string[]>([])

  const billsFollowingQuery = async () => {
    const q = query(
      subscriptionRef,
      where("uid", "==", `${uid}`),
      where("type", "==", "bill")
    )
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

  const orgsFollowingQuery = async () => {
    const q = query(
      subscriptionRef,
      where("uid", "==", `${uid}`),
      where("type", "==", "org")
    )
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      orgsList.push(doc.data().orgId)
    })

    if (orgsFollowing.length === 0 && orgsList.length != 0) {
      setOrgsFollowing(orgsList)
    }
  }

  useEffect(() => {
    uid ? orgsFollowingQuery() : null
  })

  const handleUnfollowClick = async (unfollow: UnfollowModalConfig | null) => {
    if (unfollow !== null) {
      let topicName = ""
      if (unfollow.type == "bill") {
        topicName = `bill-${unfollow.court.toString()}-${unfollow.typeId}`
      } else {
        topicName = `org-${unfollow.typeId}`
      }

      await deleteDoc(doc(subscriptionRef, topicName))

      setBillsFollowing([])
      setOrgsFollowing([])
      setUnfollow(null)
    }
  }

  return (
    <>
      <TitledSectionCard className={className}>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
          <Stack>
            <h2>Bills You Follow</h2>
            {billsFollowing.map((element: string, index: number) => (
              <FollowedItem
                key={index}
                element={element}
                setUnfollow={setUnfollow}
                type={"bill"}
              />
            ))}
          </Stack>
        </div>
      </TitledSectionCard>
      <TitledSectionCard className={`${className}`}>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
          <Styled>
            <Row>
              <Col>
                <h2 className={``}>Organizations You Follow</h2>
              </Col>
            </Row>
            {orgsFollowing.map((element: string, index: number) => (
              <FollowedItem
                key={index}
                element={element}
                setUnfollow={setUnfollow}
                type={"org"}
              />
            ))}
          </Styled>
        </div>
      </TitledSectionCard>
      <UnfollowModal
        handleUnfollowClick={handleUnfollowClick}
        onHide={close}
        onUnfollowClose={() => setUnfollow(null)}
        show={unfollow ? true : false}
        unfollow={unfollow}
      />
    </>
  )
}

function FollowedItem({
  key,
  element,
  setUnfollow,
  type
}: {
  key: number
  element: any
  setUnfollow: Dispatch<SetStateAction<UnfollowModalConfig | null>>
  type: string
}) {
  const { result: profile, loading } = usePublicProfile(element)

  let displayName = ""
  if (profile?.displayName) {
    displayName = profile.displayName
  }

  return (
    <Styled key={key}>
      {type === "bill" ? (
        <>
          <External
            href={`https://malegislature.gov/Bills/${element?.court}/${element?.billId}`}
          >
            {formatBillId(element?.billId)}
          </External>
          <Row>
            <Col>
              <BillFollowingTitle court={element?.court} id={element?.billId} />
            </Col>
            <UnfollowButton
              displayName={displayName}
              element={element}
              setUnfollow={setUnfollow}
              type={type}
            />
          </Row>
        </>
      ) : (
        <>
          {loading ? (
            <Row>
              <Spinner animation="border" className="mx-auto" />
            </Row>
          ) : (
            <Row className={`align-items-center`}>
              <Col className={"align-items-center d-flex"}>
                <OrgIconSmall src={profile?.profileImage} />
                <Internal href={`profile?id=${element}`}>
                  {displayName}
                </Internal>
              </Col>
              <UnfollowButton
                displayName={displayName}
                element={element}
                setUnfollow={setUnfollow}
                type={type}
              />
            </Row>
          )}
        </>
      )}
      <hr className={`mt-3`} />
    </Styled>
  )
}

function BillFollowingTitle({ court, id }: { court: number; id: string }) {
  const { loading, error, result: bill } = useBill(court, id)

  if (loading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  } else if (error) {
    return (
      <Alert variant="danger">An error occured. Please refresh the page.</Alert>
    )
  } else if (bill) {
    return <h6>{bill?.content.Title}</h6>
  }
  return null
}

function UnfollowButton({
  displayName,
  element,
  setUnfollow,
  type
}: {
  displayName: string
  element: any
  setUnfollow: Dispatch<SetStateAction<UnfollowModalConfig | null>>
  type: string
}) {
  const handleClick = () => {
    if (type === "bill") {
      setUnfollow({
        court: element?.court,
        orgName: "",
        type: "bill",
        typeId: element?.billId
      })
    } else {
      setUnfollow({
        court: 0,
        orgName: displayName,
        type: "org",
        typeId: element
      })
    }
  }

  return (
    <Col
      onClick={() => {
        handleClick()
      }}
    >
      <button
        className={`btn btn-link d-flex ms-auto p-0 text-decoration-none`}
      >
        <h6>Unfollow</h6>
      </button>
    </Col>
  )
}
