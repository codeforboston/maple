import { useState } from "react"
import { Col, Row, Container } from "../bootstrap"
import Tab from "react-bootstrap/Tab"
import Nav from "react-bootstrap/Nav"
import Dropdown from "react-bootstrap/Dropdown"
import { useMediaQuery } from "usehooks-ts"
import { useTranslation } from "next-i18next"
import { NewsCard } from "./NewsCard"
import { NewsType, NewsItem, useNews } from "components/db/news"


type NewsFeedProps = {
  type: NewsType
  newsItems : NewsItem[]
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
  // const { result: newsItems = [] as NewsItem[] } = useNews()

  const newsItems = [
    { id: "1", title: "MAPLE Launches New Platform", url: "https://example.com/1", author: "Jane Smith", type: "article", publishDate: "2024-01-15", createdAt: null, description: "MAPLE has launched a new platform to enhance civic engagement and streamline public participation in government processes. MAPLE has launched a new platform to enhance civic engagement and streamline public participation in government processes." },
    { id: "2", title: "Civic Tech Innovation Award", url: "https://example.com/2", author: "Award Committee", type: "award", publishDate: "2024-02-20", createdAt: null, description: "The Civic Tech Innovation Award recognizes outstanding contributions to the field of civic technology." },
    { id: "3", title: "Democracy in the Digital Age", url: "https://example.com/3", author: "John Doe", type: "book", publishDate: "2024-03-10", createdAt: null, description: "A comprehensive look at how digital technologies are reshaping democratic processes." },
    { id: "4", title: "The Engaged Citizen", url: "https://example.com/4", author: "Alice Brown", type: "book", publishDate: "2024-04-05", createdAt: null, description: "Exploring the role of active citizenship in modern democracies." },
    { id: "5", title: "The Engaged Citizen", url: "https://example.com/4", author: "Alice Brown", type: "book", publishDate: "2024-04-05", createdAt: null, description: "Exploring the role of active citizenship in modern democracies." },
    { id: "6", title: "The Engaged Citizen", url: "https://example.com/4", author: "Alice Brown", type: "book", publishDate: "2024-04-05", createdAt: null, description: "Exploring the role of active citizenship in modern democracies." },
    { id: "7", title: "The Engaged Citizen", url: "https://example.com/4", author: "Alice Brown", type: "book", publishDate: "2024-04-05", createdAt: null, description: "Exploring the role of active citizenship in modern democracies." },
  ] as unknown as NewsItem[]


  return (
    <Container className="ptx-4 pt-5 gap-4">
      <h1 className="fw-bold m-3">{t("title")}</h1>
      <div className="bg-white rounded my-5">
        <Tab.Container defaultActiveKey="media">
          {isMobile ? <TabDropdown /> : <TabGroup />}
          <Row className="p-3 g-0">
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

const TabGroup = () => {
  const { t } = useTranslation("inTheNews")
  return (
    <Row className="p-3 g-0 fs-4">
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
