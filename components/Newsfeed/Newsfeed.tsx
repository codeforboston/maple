import { collection, query, where, getDocs } from "firebase/firestore"
import ErrorPage from "next/error"
import { useEffect, useState } from "react"
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

type NotificationProps = {
  bodyText: string
  court: string
  header: string
  id: string
  subheader: string
  timestamp: string
  topicName: string
  type: string
}

type Notifications = NotificationProps[]

export default function Newsfeed() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  const { user } = useAuth()
  const uid = user?.uid
  const { result: profile, loading } = usePublicProfile(uid)
  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/userNotificationFeed/`
  )

  const [isShowingOrgs, setIsShowingOrgs] = useState<boolean>(true)
  const [isShowingBills, setIsShowingBills] = useState<boolean>(true)

  const [allResults, setAllResults] = useState<Notifications>([])
  const [orgResults, setOrgResults] = useState<Notifications>([])
  const [billResults, setBillResults] = useState<Notifications>([])

  const [notificationsDisplay, setNotificationsDisplay] =
    useState<Notifications>([])
  const [shouldDisplayResults, setShouldDisplayResults] =
    useState<boolean>(true)

  const onOrgFilterChange = (isShowing: boolean) => {
    setIsShowingOrgs(isShowing)

    setShouldDisplayResults(true)
    if (isShowing && isShowingBills) {
      return setNotificationsDisplay(allResults)
    } else if (isShowing) {
      return setNotificationsDisplay(orgResults)
    } else if (isShowingBills) {
      return setNotificationsDisplay(billResults)
    }
    return setShouldDisplayResults(false)
  }

  const onBillFilterChange = (isShowing: boolean) => {
    setIsShowingBills(isShowing)

    setShouldDisplayResults(true)
    if (isShowingOrgs && isShowing) {
      return setNotificationsDisplay(allResults)
    } else if (isShowingOrgs) {
      return setNotificationsDisplay(orgResults)
    } else if (isShowing) {
      return setNotificationsDisplay(billResults)
    }
    return setShouldDisplayResults(false)
  }

  const notificationQuery = async () => {
    let notificationList: Notifications = []
    const q = query(subscriptionRef, where("uid", "==", `${uid}`))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      notificationList.push(doc.data().notification)
    })

    if (notificationsDisplay.length === 0 && notificationList.length != 0) {
      setAllResults(notificationList)
      setOrgResults(
        notificationList.filter(notification => notification.type === "org")
      )
      setBillResults(
        notificationList.filter(notification => notification.type === "bill")
      )
      setNotificationsDisplay(allResults)
    }
  }

  useEffect(() => {
    uid ? notificationQuery() : null
  })

  function Filters() {
    return (
      <FilterBoxes
        isMobile={isMobile}
        onOrgFilterChange={(isFiltering: boolean) => {
          onOrgFilterChange(isFiltering)
        }}
        onBillFilterChange={(isFiltering: boolean) => {
          onBillFilterChange(isFiltering)
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
                {shouldDisplayResults ? (
                  <>
                    {notificationsDisplay.map((element: NotificationProps) => (
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
                      timestamp={``}
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
