import ErrorPage from "next/error"
import { useEffect, useState } from "react"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Col, Row, Spinner } from "../bootstrap"
import { usePublicProfile } from "../db"
import {
  Header,
  HeaderTitle,
  StyledContainer
} from "./StyledNewsfeedComponents"
import { AlertCard } from "components/AlertCard/AlertCard"
import { NotificationProps, Notifications } from "./NotificationProps"
import notificationQuery from "./notification-query"
import { Timestamp } from "firebase/firestore"

export default function Newsfeed() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  const { user } = useAuth()
  const uid = user?.uid
  const { result: profile, loading } = usePublicProfile(uid)

  const [isShowingOrgs, setIsShowingOrgs] = useState<boolean>(true)
  const [isShowingBills, setIsShowingBills] = useState<boolean>(true)

  const [allResults, setAllResults] = useState<Notifications>([])
  const [filteredResults, setFilteredResults] = useState<Notifications>([])

  // Update the filter function
  useEffect(() => {
    const results = allResults.filter(result => {
      if (isShowingOrgs && result.type === "org") return true
      if (isShowingBills && result.type === "bill") return true
      return false
    })

    setFilteredResults(results)
  }, [isShowingOrgs, isShowingBills, allResults])

  const onOrgFilterChange = (isShowing: boolean) => {
    setIsShowingOrgs(isShowing)
  }

  const onBillFilterChange = (isShowing: boolean) => {
    setIsShowingBills(isShowing)
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (uid) {
          const notifications = await notificationQuery(uid)
          setAllResults(notifications)
          setFilteredResults(notifications)
        }
      } catch (error) {
        console.error("Error fetching notifications: " + error)
      }
    }
    fetchNotifications()
  }, [uid])

  function Filters() {
    return (
      <FilterBoxes
        isMobile={isMobile}
        onOrgFilterChange={(isShowing: boolean) => {
          onOrgFilterChange(isShowing)
        }}
        onBillFilterChange={(isShowing: boolean) => {
          onBillFilterChange(isShowing)
        }}
        isShowingOrgs={isShowingOrgs}
        isShowingBills={isShowingBills}
      />
    )
  }

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
                    <Filters />
                  ) : (
                    <Col className="d-flex flex-column">
                      <Filters />
                    </Col>
                  )}
                </Header>
                {filteredResults.length > 0 ? (
                  <>
                    {filteredResults.map((element: NotificationProps) => (
                      <div className="pb-4" key={element.id}>
                        <AlertCard
                          header={element.header}
                          subheader={element.subheader}
                          timestamp={element.timestamp}
                          headerImgSrc={`${
                            element.type === `org`
                              ? `/profile-org-white.svg`
                              : ``
                          }`}
                          bodyImgSrc={``}
                          bodyImgAltTxt={``}
                          bodyText={element.bodyText}
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="pb-4">
                    <AlertCard
                      header={`No Results`}
                      subheader={``}
                      timestamp={Timestamp.now()}
                      headerImgSrc={``}
                      bodyImgSrc={``}
                      bodyImgAltTxt={``}
                      bodyText={`There are no news updates for your current followed topics`}
                    />
                  </div>
                )}
                <div className="d-flex justify-content-center mt-2 mb-3">
                  Pagination Element to be wired to backend
                </div>
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

function FilterBoxes({
  isMobile,
  onOrgFilterChange,
  onBillFilterChange,
  isShowingOrgs,
  isShowingBills
}: {
  isMobile: boolean
  onOrgFilterChange: any
  onBillFilterChange: any
  isShowingOrgs: boolean
  isShowingBills: boolean
}) {
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
            id="orgCheck"
            onChange={event => {
              const inputDomElement = event.target
              onOrgFilterChange(inputDomElement.checked)
            }}
            checked={isShowingOrgs}
          />
          <label className="form-check-label" htmlFor="orgCheck">
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
            id="billCheck"
            onChange={event => {
              const inputDomElement = event.target
              onBillFilterChange(inputDomElement.checked)
            }}
            checked={isShowingBills}
          />
          <label className="form-check-label" htmlFor="billCheck">
            Bill Updates
          </label>
        </div>
      </Row>
    </>
  )
}
