import { flags } from "components/featureFlags"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Col, Container, Row } from "../bootstrap"
import { TestimonyFormPanel } from "../publish"
import { Banner } from "../shared/StyledSharedComponents"
import { Back } from "./Back"
import { BillNumber, Styled } from "./BillNumber"
import { BillTestimonies } from "./BillTestimonies"
import BillTrackerConnectedView from "./BillTracker"
// import { LobbyingTable } from "./LobbyingTable"
import { Committees, Hearing, Sponsors } from "./SponsorsAndCommittees"
import { LobbyingTable } from "./LobbyingTable"
import { Status } from "./Status"
import { Summary } from "./Summary"
import { BillProps } from "./types"
import { FollowButton } from "components/shared/FollowButton"
import { isCurrentCourt } from "functions/src/shared"

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

export const BillDetails = ({ bill }: BillProps) => {
  const { t } = useTranslation("common")
  return (
    <>
      {!isCurrentCourt(bill.court) && (
        <Banner>
          this bill is from session {bill.court} - not the current session
        </Banner>
      )}
      <StyledContainer className="mt-3 mb-3">
        <Row>
          <Col>
            <Back href="/bills">{t("back_to_bills")}</Back>
          </Col>
        </Row>
        {bill.history.length > 0 ? (
          <>
            <Row>
              <Col>
                <BillNumber bill={bill} />
              </Col>
              <Col xs={6} className="d-flex justify-content-end">
                <Status bill={bill} />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col xs={12} className="d-flex justify-content-end">
                <FollowButton bill={bill} />
              </Col>
            </Row>
          </>
        ) : (
          <Row>
            <Col>
              <BillNumber bill={bill} />
            </Col>
            <Col xs={6} className="d-flex justify-content-end">
              <Styled>
                <FollowButton bill={bill} />
              </Styled>
            </Col>
          </Row>
        )}
        <Row className="mt-2">
          <Col>
            <Summary bill={bill} />
          </Col>
        </Row>
        <Row>
          <Col md={8}>
            <Sponsors bill={bill} className="mt-4 pb-1" />
            <BillTestimonies bill={bill} className="mt-4" />
            {/*<LobbyingTable bill={bill} className="mt-4 pb-1" /> This feature not yet ready*/}
          </Col>
          <Col md={4}>
            <Committees bill={bill} className="mt-4 pb-1" />
            <Hearing
              bill={bill}
              className="bg-secondary d-flex justify-content-center mt-4 pb-1 text-light"
            />
            <TestimonyFormPanel bill={bill} />
            {flags().billTracker && (
              <BillTrackerConnectedView bill={bill} className="mt-4" />
            )}
          </Col>
        </Row>
      </StyledContainer>
    </>
  )
}
