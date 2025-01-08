import { useFlags } from "components/featureFlags"
import styled from "styled-components"
import { useAuth } from "../auth"
import { Col, Container, Image, Row } from "../bootstrap"
import { TestimonyFormPanel } from "../publish"
import { Banner } from "../shared/StyledSharedComponents"
import { Back } from "./Back"
import { BillNumber, Styled } from "./BillNumber"
import { BillTestimonies } from "./BillTestimonies"
import BillTrackerConnectedView from "./BillTracker"
import { LobbyingTable } from "./LobbyingTable"
import { Committees, Hearing, Sponsors } from "./SponsorsAndCommittees"
import { Status } from "./Status"
import { Summary } from "./Summary"
import { BillProps } from "./types"
import { useTranslation } from "next-i18next"
import { isCurrentCourt } from "functions/src/shared"
import { FollowBillButton } from "components/shared/FollowButton"
import { PendingUpgradeBanner } from "components/PendingUpgradeBanner"
import { FollowContext, OrgFollowStatus } from "components/shared/FollowContext"
import { useState } from "react"

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

const StyledImage = styled(Image)`
  width: 14.77px;
  height: 12.66px;

  margin-left: 8px;
`

export const BillDetails = ({ bill }: BillProps) => {
  const { t } = useTranslation("common")

  const { user } = useAuth()  // Get the logged-in user (adjust according to your auth logic)
  const isPendingUpgrade = user?.claims?.role === "pendingUpgrade" // Ensure the role check is based on the authenticated user
  const flags = useFlags()

  const [followStatus, setFollowStatus] = useState<OrgFollowStatus>({})

  return (
    <>
      <FollowContext.Provider value={{ followStatus, setFollowStatus }}>
        {isPendingUpgrade && <PendingUpgradeBanner />}
        {!isCurrentCourt(bill.court) && (
          <Banner>{t("bill.old_session", { billCourt: bill.court })}</Banner>
        )}

        <StyledContainer className="mt-3 mb-3">
          <Row>
            <Col>
              <Back href="/bills">{t("back_to_bills")}</Back>
            </Col>
          </Row>
          {bill.history.length > 0 ? (
            <>
              <Row className="align-items-end justify-content-start">
                <Col md={2}>
                  <BillNumber bill={bill} />
                </Col>
                <Col
                  xs={10}
                  md={6}
                  className="mb-3 ms-auto d-flex justify-content-end"
                >
                  <Status bill={bill} />
                </Col>
              </Row>
              <Row className="mb-4">
                <Col xs={12} className="d-flex justify-content-end">
                  {flags.notifications && user && <FollowBillButton bill={bill} />}
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
                  {flags.notifications && user && <FollowBillButton bill={bill} />}
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
              {flags.lobbyingTable && (
                <LobbyingTable bill={bill} className="mt-4 pb-1" />
              )}
            </Col>
            <Col md={4}>
              <Committees bill={bill} className="mt-4 pb-1" />
              <Hearing
                bill={bill}
                className="bg-secondary d-flex justify-content-center mt-4 pb-1 text-light"
              />
              <TestimonyFormPanel bill={bill} />
              {flags.billTracker && (
                <BillTrackerConnectedView bill={bill} className="mt-4" />
              )}
            </Col>
          </Row>
        </StyledContainer>
      </FollowContext.Provider>
    </>
  )
}
