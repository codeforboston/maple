import styled from "styled-components"
import { Button, Col, Container, Row, Stack } from "../bootstrap"
import { TestimonyFormPanel } from "../publish"
import { Back } from "./Back"
import { BillNumber } from "./BillNumber"
import { BillTestimonies } from "./BillTestimonies"
import { formatBillId } from "../formatting"
import { SponsorsAndCommittees } from "./SponsorsAndCommittees"
import { Status } from "./Status"
import { Summary } from "./Summary"
import { BillProps } from "./types"
import { useAuth } from "../auth"
import { ProfileHook, useProfile } from "../db"

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

export const Layout = ({ bill }: BillProps) => {
  const bid = bill.id
  const { user } = useAuth()
  const uid = user?.uid
  const actions = useProfile()
  const profile = actions.profile

  let userBillList = profile?.billsFollowing ? profile.billsFollowing : []

  async function updateProfile({ actions }: { actions: ProfileHook }) {
    const { updateBillsFollowing } = actions
    await updateBillsFollowing(userBillList)
  }

  const handleFollowClick = async () => {
    userBillList.includes(bid) ? null : (userBillList = [...userBillList, bid])
    await updateProfile({ actions })
  }

  const handleUnfollowClick = async () => {
    userBillList = userBillList.filter(bill => bill !== bid)
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
          <Status bill={bill} />
        </Col>
      </Row>
      <Stack className={`mb-4`} direction={`horizontal`}>
        <Col className={`col-8`} />
        <Button
          className={`btn btn-primary btn-sm ms-auto py-2
            ${uid ? "" : "visually-hidden"}
          `}
          onClick={
            userBillList?.includes(bid)
              ? handleUnfollowClick
              : handleFollowClick
          }
        >
          {userBillList?.includes(bid) ? "Following " : "Follow "}
          {formatBillId(bill.id)}
        </Button>
      </Stack>
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
