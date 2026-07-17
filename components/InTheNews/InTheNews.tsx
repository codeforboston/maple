import { useState, Fragment } from "react"
import { Col, Row, Badge, Spinner } from "../bootstrap"
import Tab from "react-bootstrap/Tab"
import Nav from "react-bootstrap/Nav"
import Dropdown from "react-bootstrap/Dropdown"
import { useMediaQuery } from "usehooks-ts"
import { useTranslation } from "next-i18next"
import { NewsCard } from "./NewsCard"
import { NewsType, NewsItem, useNews } from "components/db/news"
import LearnBreadcrumb from "../learn/LearnBreadcrumb"
import LearnHeader from "../learn/LearnHeader"
import LearnLayout from "../learn/LearnLayout"

type NewsFeedProps = {
  type: NewsType | null
  newsItems: NewsItem[]
}

const newsTypePlurals: (keyof TabCounts)[] = ["media", "awards", "books"]
type TabCounts = {
  media: number
  awards: number
  books: number
}

const NewsFeed = ({ type, newsItems }: NewsFeedProps) => {
  return (
    <div className="d-flex flex-column align-items-left gap-3 w-100">
      {newsItems
        .filter(item => item.type === type || type === null)
        .map((item, index) => (
          <NewsCard key={index} newsItem={item} />
        ))}
    </div>
  )
}

export const InTheNews = () => {
  const { t } = useTranslation(["inTheNews", "common"])
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { result: newsItems, loading } = useNews()

  const counts: TabCounts | null = newsItems
    ? {
        media: newsItems.filter(item => item.type === "article").length,
        awards: newsItems.filter(item => item.type === "award").length,
        books: newsItems.filter(item => item.type === "book").length
      }
    : null

  return (
    <LearnLayout width="medium">
      <LearnBreadcrumb section={t("breadcrumb")} eyebrow={t("common:about")} />
      <LearnHeader
        title={t("title")}
        subhead={t("subhead")}
        titleSize="2.25rem"
        subheadMaxWidth="none"
      />
      <div className="d-flex flex-column gap-4">
        {loading ? (
          <div className="d-flex justify-content-center p-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : newsItems &&
          counts &&
          newsItems.length > 10 &&
          [counts.media, counts.awards, counts.books].filter(Boolean).length >
            1 ? (
          <Tab.Container defaultActiveKey="media">
            {isMobile ? (
              <TabDropdown counts={counts} />
            ) : (
              <TabGroup counts={counts} />
            )}
            <Row className="g-0">
              <Col>
                <Tab.Content>
                  <Tab.Pane eventKey="media">
                    <NewsFeed type="article" newsItems={newsItems ?? []} />
                  </Tab.Pane>
                  <Tab.Pane eventKey="awards">
                    <NewsFeed type="award" newsItems={newsItems ?? []} />
                  </Tab.Pane>
                  <Tab.Pane eventKey="books">
                    <NewsFeed type="book" newsItems={newsItems ?? []} />
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        ) : (
          <NewsFeed type={null} newsItems={newsItems ?? []} />
        )}
      </div>
    </LearnLayout>
  )
}

const TabGroup = ({ counts }: { counts: TabCounts }) => {
  const { t } = useTranslation("inTheNews")
  return (
    <Row className="g-0 fs-5 fw-semibold">
      {newsTypePlurals
        .filter(val => counts[val])
        .map(val => (
          <Col key={val} className="text-center">
            <Nav className="in-the-news flex-column">
              <Nav.Item>
                <Nav.Link eventKey={val}>
                  <div className="d-flex justify-content-center align-items-center gap-2 p-3">
                    {t(`${val}.title`)}
                    <Badge
                      bg="secondary"
                      className="rounded-pill px-3 fw-bold"
                      style={{
                        fontSize: "0.875rem"
                      }}
                    >
                      {counts[val]}
                    </Badge>
                  </div>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        ))}
    </Row>
  )
}

const TabDropdown = ({ counts }: { counts: TabCounts }) => {
  const { t } = useTranslation("inTheNews")
  const [selectedTab, setSelectedTab] = useState<string>(t("media.title"))

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
            {newsTypePlurals
              .filter(val => counts[val])
              .map((val, i) => (
                <Fragment key={val}>
                  {i !== 0 && <Dropdown.Divider />}
                  <Dropdown.Item
                    className="p-2"
                    eventKey={val}
                    onClick={() => handleTabClick(t(`${val}.title`))}
                  >
                    {t(`${val}.title`)}
                  </Dropdown.Item>
                </Fragment>
              ))}
          </Dropdown.Menu>
        </Dropdown>
      </Col>
    </Row>
  )
}
