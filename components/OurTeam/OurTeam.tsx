import styled from "styled-components"
import { Col, Row } from "../bootstrap"
import Tab from "react-bootstrap/Tab"
import Nav from "react-bootstrap/Nav"
import { SteeringCommittee } from "./SteeringCommittee"
import { AdvisoryBoard } from "./AdvisoryBoard"
import { OurPartners } from "./Partners"
import { useTranslation } from "next-i18next"
import { PageDescr } from "../shared/CommonComponents"
import LearnBreadcrumb from "../learn/LearnBreadcrumb"
import LearnHeader from "../learn/LearnHeader"
import LearnLayout from "../learn/LearnLayout"

// The tab panes wrap their content in bootstrap .container (gutters + a centered
// max-width), which insets it from the page header. Flatten it so the content
// sits flush with the "Our Team" header above.
const TeamBody = styled.div`
  .container {
    max-width: 100%;
    padding-left: 0;
    padding-right: 0;
  }

  /* The Partners intro (PageDescr) defaults to 25px bold; scope it down to a
     normal-weight lead-in. */
  ${PageDescr} {
    font-size: 1rem;
    font-weight: 400;
  }
`

export const OurTeam = () => {
  const { t } = useTranslation(["our-team", "common"])

  return (
    <LearnLayout width="wide">
      <LearnBreadcrumb section={t("breadcrumb")} eyebrow={t("common:about")} />
      <LearnHeader title={t("title")} titleSize="2.25rem" />
      <TeamBody>
        <Tab.Container defaultActiveKey="steering_committee">
          <TabGroup />
          <Row className="py-3 g-0">
            <Col>
              <Tab.Content>
                <Tab.Pane eventKey="steering_committee">
                  <SteeringCommittee />
                </Tab.Pane>
                <Tab.Pane eventKey="advisory_board">
                  <AdvisoryBoard />
                </Tab.Pane>
                <Tab.Pane eventKey="partners">
                  <OurPartners />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </TeamBody>
    </LearnLayout>
  )
}

// Tabs stay in a single row at every screen size; the font shrinks on narrow
// viewports so the three fit rather than collapsing to a dropdown.
const TabsRow = styled(Row)`
  @media (max-width: 36rem) {
    font-size: 0.8125rem;
  }

  @media (max-width: 22rem) {
    font-size: 0.6875rem;
  }
`

const TabGroup = () => {
  const { t } = useTranslation("our-team")
  return (
    <TabsRow className="py-3 g-0">
      <Col className="text-center">
        <Nav className="our-team-tab flex-column">
          <Nav.Item>
            <Nav.Link eventKey="steering_committee">
              {t("steering.title")}
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>
      <Col className="text-center">
        <Nav className="our-team-tab flex-column">
          <Nav.Item>
            <Nav.Link eventKey="advisory_board">{t("advisory.title")}</Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>
      <Col className="text-center">
        <Nav className="our-team-tab flex-column">
          <Nav.Item>
            <Nav.Link eventKey="partners">{t("partners.title")}</Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>
    </TabsRow>
  )
}
