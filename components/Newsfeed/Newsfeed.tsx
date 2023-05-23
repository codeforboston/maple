import {
  InstantSearch,
  Pagination
} from "@alexjball/react-instantsearch-hooks-web"
import { collection, query, where, getDocs } from "firebase/firestore"
import ErrorPage from "next/error"
import { useEffect, useState } from "react"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Col, Row, Spinner } from "../bootstrap"
import { usePublicProfile } from "../db"
import { firestore } from "../firebase"
import {
  Header,
  HeaderTitle,
  StyledContainer
} from "./StyledNewsfeedComponents"
import { AlertCard } from "components/AlertCard/AlertCard"
import { getServerConfig } from "components/search/common"
import { SearchContainer } from "components/search/SearchContainer"
import { SearchErrorBoundary } from "components/search/SearchErrorBoundary"
import { initialSortByValue } from "components/search/SortBy"
import { currentGeneralCourt } from "functions/src/shared"

const searchClient = new TypesenseInstantSearchAdapter({
  server: getServerConfig(),
  additionalSearchParameters: {
    query_by: "number,title,body",
    exclude_fields: "body"
  }
}).searchClient

export default function Newsfeed() {
  return (
    <SearchErrorBoundary>
      <InstantSearch
        indexName={initialSortByValue}
        initialUiState={{
          [initialSortByValue]: {
            refinementList: { court: [String(currentGeneralCourt)] }
          }
        }}
        searchClient={searchClient}
        routing={false}
        // routing={useRouting()}
      >
        <Layout />
      </InstantSearch>
    </SearchErrorBoundary>
  )
}

const Layout = () => {
  const isMobile = useMediaQuery("(max-width: 768px)")

  const { user } = useAuth()
  const { result: profile, loading } = usePublicProfile(user?.uid)
  const uid = user?.uid
  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/userNotificationFeed/`
  )

  let notificationList: {
    bodyText: string
    court: string
    header: string
    id: string
    subheader: string
    timestamp: string
    topicName: string
    type: string
  }[] = []

  const [notificationsDisplayed, setNotificationsDisplayed] = useState<
    {
      bodyText: string
      court: string
      header: string
      id: string
      subheader: string
      timestamp: string
      topicName: string
      type: string
    }[]
  >([])

  const notificationQuery = async () => {
    const q = query(subscriptionRef, where("uid", "==", `${uid}`))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      notificationList.push(doc.data().notification)
    })

    if (notificationsDisplayed.length === 0 && notificationList.length != 0) {
      setNotificationsDisplayed(notificationList)
    }
  }

  useEffect(() => {
    uid ? notificationQuery() : null
  })

  return (
    <>
      {loading ? (
        <Row>
          <Spinner animation="border" className="mx-auto" />
        </Row>
      ) : (
        <>
          {profile ? (
            <>
              <StyledContainer>
                <Header>
                  <HeaderTitle>Newsfeed</HeaderTitle>
                  {isMobile ? (
                    <FilterBox isMobile={isMobile} />
                  ) : (
                    <Col className="d-flex flex-column">
                      <FilterBox isMobile={isMobile} />
                    </Col>
                  )}
                </Header>
                {notificationsDisplayed.map(
                  (
                    element: {
                      bodyText: string
                      court: string
                      header: string
                      id: string
                      subheader: string
                      timestamp: string
                      topicName: string
                      type: string
                    },
                    index: number
                  ) => (
                    <div className="pb-4" key={index}>
                      <AlertCard
                        header={element.header}
                        subheader={element.subheader}
                        timestamp={element.timestamp}
                        headerImgSrc={`${
                          element.type === `org` ? `/profile-org-white.svg` : ``
                        }`}
                        bodyImgSrc={``}
                        bodyImgAltTxt={``}
                        bodyText={element.bodyText}
                      />
                    </div>
                  )
                )}
                <SearchContainer>
                  <Pagination className="d-flex justify-content-center mt-2 mb-3" />
                </SearchContainer>
              </StyledContainer>
            </>
          ) : (
            <ErrorPage statusCode={404} withDarkMode={false} />
          )}
        </>
      )}
    </>
  )
}

function FilterBox({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <Row
        className={`${
          isMobile ? "justify-content-center" : "justify-content-end"
        }`}
      >
        <div className="form-check checkbox">
          <input
            className="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckDefault"
          />
          <label className="form-check-label" htmlFor="flexCheckDefault">
            Organization Updates
          </label>
        </div>
      </Row>
      <Row
        className={`${
          isMobile ? "justify-content-center" : "justify-content-end"
        }`}
      >
        <div className="form-check checkbox">
          <input
            className="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckDefault"
          />
          <label className="form-check-label" htmlFor="flexCheckDefault">
            Bill Updates
          </label>
        </div>
      </Row>
    </>
  )
}
