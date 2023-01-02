import styled from "styled-components"
import { Button, Col, Container, Row } from "../bootstrap"
import { TestimonyFormPanel } from "../publish"
import { Back } from "./Back"
import { BillNumber } from "./BillNumber"
import { BillTestimonies } from "./BillTestimonies"
import { SponsorsAndCommittees } from "./SponsorsAndCommittees"
import { Status } from "./Status"
import { Summary } from "./Summary"
import { BillProps } from "./types"
import { useAuth } from "../auth"
import { Profile, ProfileHook, useProfile } from "../db"

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

export const Layout = ({ bill }: BillProps) => {
  const { user } = useAuth()
  const uid = user?.uid
  const result = useProfile()

  console.log("Result: ", result)

  const handleFollowClick = () => {
    console.log("Bill Id: ", bill.id)
    console.log(result.profile?.billsFollowing?.includes(bill.id))
    if (result.profile?.billsFollowing == undefined) {
      console.log("undefined -> update")
      return
    }
    result.profile?.billsFollowing?.includes(bill.id)
      ? console.log("record exists, don't update")
      : console.log("record doesn't exisit -> update")
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

      <Row>
        <Button
          className={`btn btn-outline-secondary col-1
            ${uid ? "" : "visually-hidden"}
          `}
          onClick={handleFollowClick}
        >
          Follow
        </Button>
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

/*
  Follow Button   -> [x] follow/unfollow button only appears if auth user is signed in
                     [x] add array of bill #s followed to profile
                     [ ] connect Follow button to updating profile with current bill number
                           if bill number is not already in array
                     [ ] toggle Follow button to Unfollow button is bill is currently in the array
                   
  Unfollow Button -> [ ] filter out current bill number from bills followed array                  
*/
