import styled from "styled-components"
import { Button, Col, Container, Image, Row } from "../bootstrap"
import { TestimonyFormPanel } from "../publish"
import { Back } from "./Back"
import { BillNumber, Styled } from "./BillNumber"
import { BillTestimonies } from "./BillTestimonies"
import { SponsorsAndCommittees } from "./SponsorsAndCommittees"
import { Summary } from "./Summary"
import { BillProps } from "./types"
import { useAuth } from "../auth"
import { ProfileHook, useProfile } from "../db"

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

const StyledImage = styled(Image)`
  width: 14.77px;
  height: 12.66px;

  margin-left: 8px;
`

export const Layout = ({ bill }: BillProps) => {
  const billId = bill.id
  const billTitle = bill.content.Title
  const { user } = useAuth()
  const uid = user?.uid
  const actions = useProfile()
  const profile = actions.profile

  let userBillList = profile?.billsFollowing ? profile.billsFollowing : []
  let checkBill = userBillList.map(item => item).includes(billId)

  async function updateProfile({ actions }: { actions: ProfileHook }) {
    const { updateBillsFollowing } = actions
    await updateBillsFollowing(userBillList)
  }

  const handleFollowClick = async () => {
    checkBill ? null : (userBillList = [billId, ...userBillList])
    await updateProfile({ actions })
  }

  const handleUnfollowClick = async () => {
    userBillList = userBillList.filter(item => item !== billId)
    await updateProfile({ actions })
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
        <Col xs={6} className="d-flex justify-content-end">
          <Styled>
            <Button
              className={`btn btn-primary btn-sm ms-auto py-2
                ${uid ? "" : "visually-hidden"}
              `}
              onClick={checkBill ? handleUnfollowClick : handleFollowClick}
            >
              {checkBill ? "Following" : "Follow"}
              {checkBill ? (
                <StyledImage src="/check-white.svg" alt="checkmark" />
              ) : null}
            </Button>
          </Styled>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col>
          <Summary bill={bill} />
        </Col>
      </Row>
      <Row>
        <Col md={8}>
          <SponsorsAndCommittees bill={bill} className="mt-4" />
          <BillTestimonies bill={bill.content} className="mt-4" />
        </Col>
        <Col md={4} className="mt-4">
          <TestimonyFormPanel bill={bill} />
        </Col>
      </Row>
    </StyledContainer>
  )
}
