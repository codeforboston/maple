import ErrorPage from "next/error"
import { collection, getDocs, query, where } from "firebase/firestore"
import { getFunctions, httpsCallable } from "firebase/functions"
import { useTranslation } from "next-i18next"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Col, Row, Spinner } from "../bootstrap"
import { usePublicProfile } from "../db"
import { AlertCard, AlertCardV2 } from "components/AlertCard/AlertCard"
import { NotificationProps, Notifications } from "./NotificationProps"
import notificationQuery from "./notification-query"
import { firestore } from "components/firebase"
import { Timestamp } from "firebase/firestore"
import {
  BillCol,
  Header,
  HeaderTitle,
  StyledContainer
} from "./StyledNewsfeedComponents"
import {
  BillElement,
  UserElement
} from "components/EditProfilePage/FollowingTabComponents"

export default function Newsfeed() {
  const { t } = useTranslation("common")
  // const isMobile = useMediaQuery("(max-width: 768px)")

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
      if (isShowingOrgs && result.isUserMatch) return true
      if (isShowingBills && result.isBillMatch) return true
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

    console.log("results: ", filteredResults)

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

  const subscriptionRef = useMemo(
    () =>
      // returns new object only if uid changes
      uid
        ? collection(firestore, `/users/${uid}/activeTopicSubscriptions/`)
        : null,
    [uid]
  )

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
                          {element.type === `bill` ? (
                            <AlertCardV2
                              court={element.court}
                              header={element.header}
                              subheader={element.subheader}
                              timestamp={element.timestamp}
                              headerImgSrc={`/images/bill-capitol.svg`}
                              headerImgTitle={``}
                              bodyImgSrc={``}
                              bodyImgAltTxt={``}
                              bodyText={element.bodyText}
                            />
                          ) : (
                            <AlertCard
                              header={element.header}
                              subheader={element.subheader}
                              timestamp={element.timestamp}
                              headerImgSrc={`${
                                element.type === `bill`
                                  ? ``
                                  : `/thumbs-${element.position}.svg`
                              }`}
                              headerImgTitle={`${
                                element.type === `bill` ? "" : element.position
                              }`}
                              bodyImgSrc={``}
                              bodyImgAltTxt={``}
                              bodyText={element.bodyText}
                            />
                          )}
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
