import styled from "styled-components"
import { useState } from "react"
import { Col, Row, Container } from "../bootstrap"
import Tab from "react-bootstrap/Tab"
import Nav from "react-bootstrap/Nav"
import Dropdown from "react-bootstrap/Dropdown"
import { SteeringCommittee } from "./SteeringCommittee"
import { AdvisoryBoard } from "./AdvisoryBoard"
import { OurPartners } from "./Partners"
import { useMediaQuery } from "usehooks-ts"
import { useTranslation } from "next-i18next"

export const OurTeam = () => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  return (
    <StyledContainer className="ptx-4">
      <Tab.Container defaultActiveKey="steering_committee">
        {isMobile ? <TabDropdown /> : <TabGroup />}
        <Row className="p-3 g-0">
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
    </StyledContainer>
  )
}

const TabGroup = () => {
  const { t } = useTranslation("our-team")
  return (
    <Row className="p-3 g-0">
      <Col md={4} className="text-center">
        <Nav className="our-team-tab flex-column">
          <Nav.Item>
            <Nav.Link eventKey="steering_committee">
              {t("steering.title")}
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>
      <Col md={4} className="text-center">
        <Nav className="our-team-tab flex-column">
          <Nav.Item>
            <Nav.Link eventKey="advisory_board">{t("advisory.title")}</Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>
      <Col md={4} className="text-center">
        <Nav className="our-team-tab flex-column">
          <Nav.Item>
            <Nav.Link eventKey="partners">{t("partners.title")}</Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>
    </Row>
  )
}

const TabDropdown = () => {
  const { t } = useTranslation("our-team")
  const [selectedTab, setSelectedTab] = useState<string>("Steering Committee")

  const handleTabClick = (tabTitle: string) => {
    setSelectedTab(tabTitle)
  }

  return (
    <Row className="p-3 g-0">
      <Col md={12}>
        <Dropdown className="our-team-dropdown">
          <Dropdown.Toggle className="our-team-dropdown-button">
            <span style={{ float: "left" }}>{selectedTab}</span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="p-2">
            <Dropdown.Item
              className="p-2"
              eventKey="steering_committee"
              onClick={() => handleTabClick("Steering Committee")}
            >
              {t("steering.title")}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              className="p-2"
              eventKey="advisory_board"
              onClick={() => handleTabClick("Advisory Board")}
            >
              {t("advisory.title")}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              className="p-2"
              eventKey="partners"
              onClick={() => handleTabClick("Partners")}
            >
              {t("partners.title")}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Col>
    </Row>
  )
}

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`
