import { useState } from "react"
import styled from "styled-components"
import { Col, Image, Row, Stack } from "../bootstrap"
import { Profile, ProfileHook } from "../db"
import { formatBillId } from "../formatting"
import { billLink, billURL, External } from "../links"
import { TitledSectionCard } from "../shared"
import { ImageInput } from "./ImageInput"
import UnfollowModal from "./UnfollowModal"

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

  const close = () => setUnfollowModal(null)

  async function updateProfile({ actions }: { actions: ProfileHook }) {
    const { updateBillsFollowing } = actions
    await updateBillsFollowing(userBillList)
  }

  const handleUnfollowClick = async (bid: string) => {
    userBillList = userBillList.filter(item => item.id !== bid)
    await updateProfile({ actions })
    setUnfollowModal(null)
  }

  let userBillList = profile?.billsFollowing ? profile.billsFollowing : []

  return (
    <>
      <TitledSectionCard className={className}>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
          <Stack>
            <h2>Bills You Follow</h2>
            {profile.billsFollowing?.map(bill => (
              <Styled key={bill.id}>
                <External href={billURL(bill.id)}>
                  {formatBillId(bill.id)}
                </External>
                <Row>
                  <Col className={`col-10`}>
                    <h6>{bill.title}</h6>
                  </Col>
                  <Col
                    className={`text-center`}
                    onClick={() => {
                      setUnfollowModal("show")
                      setCurrentBill(bill.id)
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
