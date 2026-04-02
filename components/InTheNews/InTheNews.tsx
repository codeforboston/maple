import { useState } from "react"
import { Col, Row, Container, Badge } from "../bootstrap"
import Tab from "react-bootstrap/Tab"
import Nav from "react-bootstrap/Nav"
import Dropdown from "react-bootstrap/Dropdown"
import { useMediaQuery } from "usehooks-ts"
import { useTranslation } from "next-i18next"
import { NewsCard } from "./NewsCard"
import { NewsType, NewsItem, useNews } from "components/db/news"


type NewsFeedProps = {
  type: NewsType
  newsItems: NewsItem[]
}

type TabCounts = {
  media: number
  awards: number
  books: number
}

const NewsFeed = ({
  type,
  newsItems
}: NewsFeedProps) =>
{
  return (
      <div className="d-flex flex-column align-items-left gap-1 w-100">
        {newsItems.filter(item => item.type === type).map((item, index) => (
          <NewsCard key={index} newsItem={item} />
        ))}
      </div>
  )
}

export const InTheNews = () => {
  const { t } = useTranslation("inTheNews")
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { result: newsItems = [] as NewsItem[] } = useNews()


  const counts: TabCounts = {
    media: newsItems.filter(item => item.type === "article").length,
    awards: newsItems.filter(item => item.type === "award").length,
    books: newsItems.filter(item => item.type === "book").length
  }

  return (
    <Container className="ptx-4 pt-5 gap-4 min-vh-100">
      <h1 className="fw-bold m-3" style={{ fontSize: "5rem" }}>{t("title")}</h1>
      <div className="d-flex flex-column bg-white rounded-4 my-5 gap-4 p-4">
        <Tab.Container defaultActiveKey="media">
          {isMobile ? <TabDropdown counts={counts} /> : <TabGroup counts={counts} />}
          <Row className="g-0">
            <Col>
              <Tab.Content>
                <Tab.Pane eventKey="media">
                  <div className="d-flex flex-column align-items-center">
                    <NewsFeed type="article" newsItems={newsItems} />
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="awards">
                  <div className="d-flex flex-column align-items-center">
                    <NewsFeed type="award" newsItems={newsItems} />
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="books">
                  <div className="d-flex flex-column align-items-center">
                    <NewsFeed type="book" newsItems={newsItems} />
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    </Container>
  )
}

const TabGroup = ({ counts }: { counts: TabCounts }) => {
  const { t } = useTranslation("inTheNews")
  return (
    <Row className="g-0 fs-4 fw-semibold">
      <Col md={4} className="text-center">
        <Nav className="in-the-news flex-column">
          <Nav.Item>
            <Nav.Link eventKey="media">
              <div className="d-flex justify-content-center align-items-center gap-3 p-4">
                {t("media.title")}
                <Badge bg="secondary" className="rounded-pill px-4 fw-bold" style={{ fontSize: "20px" }}>{counts.media}</Badge>
              </div>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>
      <Col md={4} className="text-center">
        <Nav className="in-the-news flex-column">
          <Nav.Item>
            <Nav.Link eventKey="awards">
              <div className="d-flex justify-content-center align-items-center gap-3 p-4">
                {t("awards.title")}
                <Badge bg="secondary" className="rounded-pill px-4 fw-bold" style={{ fontSize: "20px" }}>{counts.awards}</Badge>
              </div>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>
      <Col md={4} className="text-center">
        <Nav className="in-the-news flex-column">
          <Nav.Item>
            <Nav.Link eventKey="books">
              <div className="d-flex justify-content-center align-items-center gap-3 p-4">
                {t("books.title")}
                <Badge bg="secondary" className="rounded-pill px-4 fw-bold" style={{ fontSize: "20px" }}>{counts.books}</Badge>
              </div>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>
    </Row>
  )
}

const TabDropdown = ({ counts }: { counts: TabCounts }) => {
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
