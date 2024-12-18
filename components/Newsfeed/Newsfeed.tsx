import ErrorPage from "next/error"
import { Timestamp } from "firebase/firestore"
import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { useAuth } from "../auth"
import { Col, Row, Spinner } from "../bootstrap"
import { usePublicProfile } from "../db"
import { NotificationProps, Notifications } from "./NotificationProps"
import notificationQuery from "./notification-query"
import {
  BillCol,
  Header,
  HeaderTitle,
  StyledContainer
} from "./StyledNewsfeedComponents"
import { NewsfeedCard } from "components/NewsfeedCard/NewsfeedCard"

export default function Newsfeed() {
  const { t } = useTranslation("common")

  const { user } = useAuth()
  const uid = user?.uid
  const { result: profile, loading } = usePublicProfile(uid)

  const [isShowingOrgs, setIsShowingOrgs] = useState<boolean>(true)
  const [isShowingBills, setIsShowingBills] = useState<boolean>(true)

  const [allResults, setAllResults] = useState<Notifications>([])
  const [filteredResults, setFilteredResults] = useState<Notifications>([])

  useEffect(() => {
    const results = allResults.filter(result => {
      if (isShowingOrgs && result.type == `testimony`) return true
      if (isShowingBills && result.type == `bill`) return true
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

  function FilterBoxes({
    onOrgFilterChange,
    onBillFilterChange,
    isShowingOrgs,
    isShowingBills
  }: {
    onOrgFilterChange: any
    onBillFilterChange: any
    isShowingOrgs: boolean
    isShowingBills: boolean
  }) {
    const { t } = useTranslation("common")

    return (
      <>
        <Row className={`d-flex ms-5 mt-2 ps-4`} xs="auto">
          <Col className="form-check checkbox">
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
              {t("user_updates")}
            </label>
          </Col>
          <BillCol className="form-check checkbox">
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
              {t("bill_updates")}
            </label>
          </BillCol>
        </Row>
      </>
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
            <div className={`d-flex align-self-center`}>
              <StyledContainer>
                <Header>
                  <HeaderTitle className={`mb-5`}>
                    {t("navigation.newsfeed")}
                  </HeaderTitle>
                  <Filters />
                </Header>
                {filteredResults.length > 0 ? (
                  <>
                    {filteredResults
                      .sort(
                        (a, b) =>
                          b.timestamp.toMillis() - a.timestamp.toMillis()
                      )
                      .map((element: NotificationProps) => (
                        <div className="pb-4" key={element.id}>
                          <NewsfeedCard
                            authorUid={element.authorUid}
                            billId={element.billId}
                            bodyText={element.bodyText}
                            court={element.court}
                            header={element.header}
                            isBillMatch={element.isBillMatch}
                            isUserMatch={element.isUserMatch}
                            position={element.position}
                            subheader={element.subheader}
                            timestamp={element.timestamp}
                            testimonyId={element.testimonyId}
                            type={element.type}
                            userRole={element.userRole}
                          />
                        </div>
                      ))}
                  </>
                ) : (
                  <>
                    <div className="pb-4">
                      <NewsfeedCard
                        header={`No Results`}
                        timestamp={Timestamp.now()}
                        bodyText={`There are no news updates for your current followed topics`}
                        type={``}
                      />
                    </div>
                  </>
                )}
                {/* <div className="d-flex justify-content-center mt-2 mb-3">
                  Pagination Element to be wired to backend
                </div> */}
              </StyledContainer>
            </div>
          ) : (
            <ErrorPage statusCode={404} withDarkMode={false} />
          )}
        </>
      )}
    </>
  )
}
