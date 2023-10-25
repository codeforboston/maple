import styled from "styled-components"
import { Col, Row, Container } from "../bootstrap"
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Nav from 'react-bootstrap/Nav';
import { SteeringCommittee } from "./SteeringCommittee"
import { AdvisoryBoard } from "./AdvisoryBoard"
import OurPartners from "../OurPartners/OurPartners"

export const OurTeam = () => {
    return (
        <StyledContainer className="ptx-4">
            <Tab.Container defaultActiveKey="steering_committee">
                <Row className="p-3 g-0">
                    <Col md={4} className="text-center">
                        <Nav variant="underline" className="our-team-tab flex-column">
                            <Nav.Item>
                                <Nav.Link eventKey="steering_committee">Steering Committee</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                    <Col md={4} className="text-center">
                        <Nav variant="underline" className="our-team-tab flex-column">
                            <Nav.Item>
                                <Nav.Link eventKey="advisory_board">Advisory Board</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                    <Col md={4} className="text-center">
                        <Nav variant="underline" className="our-team-tab flex-column">
                            <Nav.Item>
                                <Nav.Link eventKey="partners">Partners</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                </Row>
                <Row className="p-3 g-0">
                    <Col>
                        <Tab.Content>
                            <Tab.Pane eventKey="steering_committee"><SteeringCommittee /></Tab.Pane>
                            <Tab.Pane eventKey="advisory_board"><AdvisoryBoard /></Tab.Pane>
                            <Tab.Pane eventKey="partners"><OurPartners /></Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </StyledContainer>
    );
}

const StyledContainer = styled(Container)`
  font-family: "Nunito";
`

