import { useTranslation } from "next-i18next"
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from "react"
import styled from "styled-components"
import { useAuth } from "../auth"
import { Alert, Col, Row, Spinner, Stack } from "../bootstrap"
import { useBill, usePublicProfile } from "../db"
import { formatBillId } from "../formatting"
import { External, Internal } from "../links"
import { TitledSectionCard } from "../shared"
import { deleteItem, FollowingQuery, Results } from "../shared/FollowingQueries"
import { OrgIconSmall } from "./StyledEditProfileComponents"
import UnfollowModal, { UnfollowModalConfig } from "./UnfollowModal"

type Props = {
  className?: string
}

export const StyledHeader = styled(External)`
  text-decoration: none;
  font-weight: 1rem;
`

export const Styled = styled.div`
  font-size: 2rem;
  a {
    display: inline-flex;
    align-items: baseline;

    font-family: "Nunito";
    font-style: normal;
    font-weight: 500;
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

  const [unfollowItem, setUnfollowItem] = useState<UnfollowModalConfig | null>(
    null
  )
  const close = () => setUnfollowItem(null)

  const [billsFollowing, setBillsFollowing] = useState<string[]>([])
  const [orgsFollowing, setOrgsFollowing] = useState<string[]>([])

  const handleQueryResults = useCallback(
    (results: Results) => {
      if (billsFollowing.length === 0 && results.bills.length != 0) {
        setBillsFollowing(results.bills)
      }

      if (orgsFollowing.length === 0 && results.orgs.length != 0) {
        setOrgsFollowing(results.orgs)
      }
    },
    [billsFollowing.length, orgsFollowing.length]
  )

  useEffect(() => {
    uid
      ? FollowingQuery(uid).then(results => handleQueryResults(results))
      : null
  }, [uid, setBillsFollowing, setOrgsFollowing, handleQueryResults])

  const handleUnfollowClick = async ({
    uid,
    unfollowItem
  }: {
    uid: string | undefined
    unfollowItem: UnfollowModalConfig | null
  }) => {
    deleteItem({ uid, unfollowItem })

    setBillsFollowing([])
    setOrgsFollowing([])
    setUnfollowItem(null)
  }

  const { t } = useTranslation("editProfile")

  return (
    <>
      <TitledSectionCard className={className}>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
          <Stack>
            <h2>{t("follow.bills")}</h2>
            {billsFollowing.map((element: any) => (
              <FollowedItem
                key={element.billId}
                element={element}
                setUnfollowItem={setUnfollowItem}
                type={"bill"}
              />
            ))}
          </Stack>
        </div>
      </TitledSectionCard>
      <TitledSectionCard className={`${className}`}>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
          <Stack>
            <h2 className="pb-3">{t("follow.orgs")}</h2>
            {orgsFollowing.map((element: any) => (
              <FollowedItem
                key={element.profileid}
                element={element}
                setUnfollowItem={setUnfollowItem}
                type={"org"}
              />
            ))}
          </Stack>
        </div>
      </TitledSectionCard>
      <UnfollowModal
        handleUnfollowClick={handleUnfollowClick}
        onHide={close}
        onUnfollowClose={() => setUnfollowItem(null)}
        show={unfollowItem ? true : false}
        uid={uid}
        unfollowItem={unfollowItem}
      />
    </>
  )
}

function FollowedItem({
  element,
  setUnfollowItem,
  type
}: {
  element: any
  setUnfollowItem: Dispatch<SetStateAction<UnfollowModalConfig | null>>
  type: string
}) {
  const { result: profile, loading } = usePublicProfile(element.profileid)

  let fullName = "default"
  if (profile?.fullName) {
    fullName = profile.fullName
  }

  return (
    <Styled>
      {type === "bill" ? (
        <>
          <StyledHeader
            href={`https://malegislature.gov/Bills/${element?.court}/${element?.billId}`}
          >
            {formatBillId(element?.billId)}
          </StyledHeader>

          <Row>
            <Col xs={9}>
              <BillFollowingTitle court={element?.court} id={element?.billId} />
            </Col>
            <Col>
              <UnfollowButton
                fullName={fullName}
                element={element}
                setUnfollowItem={setUnfollowItem}
                type={type}
              />
            </Col>
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
                <OrgIconSmall
                  className="mr-4 mt-0 mb-0 ms-0"
                  src={profile?.profileImage}
                />
                <Internal href={`organizations/${element}`}>
                  {fullName}
                </Internal>
              </Col>
              <UnfollowButton
                fullName={fullName}
                element={element}
                setUnfollowItem={setUnfollowItem}
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
  const { t } = useTranslation("editProfile")

  if (loading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  } else if (error) {
    return <Alert variant="danger">{t("content.error")}</Alert>
  } else if (bill) {
    return <h6>{bill?.content.Title}</h6>
  }
  return null
}

function UnfollowButton({
  fullName,
  element,
  setUnfollowItem,
  type
}: {
  fullName: string
  element: any
  setUnfollowItem: Dispatch<SetStateAction<UnfollowModalConfig | null>>
  type: string
}) {
  const handleClick = () => {
    if (type === "bill") {
      setUnfollowItem({
        court: element?.court,
        orgName: "",
        type: "bill",
        typeId: element?.billId
      })
    } else {
      setUnfollowItem({
        court: 0,
        orgName: fullName,
        type: "org",
        typeId: element
      })
    }
  }

  const { t } = useTranslation("editProfile")

  return (
    <Col
      onClick={() => {
        handleClick()
      }}
    >
      <button
        className={`btn btn-link d-flex ms-auto p-0 text-decoration-none`}
      >
        <h6>{t("follow.unfollow")}</h6>
      </button>
    </Col>
  )
}
