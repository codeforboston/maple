import { useState } from "react"
import { Col, Row, Container } from "../bootstrap"
import Tab from "react-bootstrap/Tab"
import Nav from "react-bootstrap/Nav"
import Dropdown from "react-bootstrap/Dropdown"
import { useMediaQuery } from "usehooks-ts"
import { useTranslation } from "next-i18next"



export const InTheNews = () => {
  const { t } = useTranslation("inTheNews")
  const isMobile = useMediaQuery("(max-width: 768px)")
  return (
    <Container className="ptx-4">
      <h1 className="fw-bold m-5">{t("title")}</h1>
      <Tab.Container defaultActiveKey="media">
        {isMobile ? <TabDropdown /> : <TabGroup />}
        <Row className="p-3 g-0">
          <Col>
            <Tab.Content>
              <Tab.Pane eventKey="media">
                <div className="d-flex flex-column align-items-center">
                  <h2 className="mb-4">Media</h2>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="awards">
                <div className="d-flex flex-column align-items-center">
                  <h2 className="mb-4">Awards</h2>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="books">
                <div className="d-flex flex-column align-items-center">
                  <h2 className="mb-4">Books</h2>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  )
}

const TabGroup = () => {
  const { t } = useTranslation("inTheNews")
  return (
    <Row className="p-3 g-0">
      <Col md={4} className="text-center">
        <Nav className="in-the-news flex-column">
          <Nav.Item>
            <Nav.Link eventKey="media">{t("media.title")}</Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>
      <Col md={4} className="text-center">
        <Nav className="in-the-news flex-column">
          <Nav.Item>
            <Nav.Link eventKey="awards">{t("awards.title")}</Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>
      <Col md={4} className="text-center">
        <Nav className="in-the-news flex-column">
          <Nav.Item>
            <Nav.Link eventKey="books">{t("books.title")}</Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>
    </Row>
  )
}

const TabDropdown = () => {
  const { t } = useTranslation("inTheNews")
  const [selectedTab, setSelectedTab] = useState<string>("Media")

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
              eventKey="media"
              onClick={() => handleTabClick("Media")}
            >
              {t("media.title")}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              className="p-2"
              eventKey="awards"
              onClick={() => handleTabClick("Awards")}
            >
              {t("awards.title")}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              className="p-2"
              eventKey="books"
              onClick={() => handleTabClick("Books")}
            >
              {t("books.title")}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Col>
    </Row>
  )
}
