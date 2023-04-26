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

export default function Newsfeed() {
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

  const [orgFilter, setOrgFilter] = useState<boolean>(true)
  const [billFilter, setBillFilter] = useState<boolean>(true)

  const onOrgFilterChange = () => {
    const orgBox = document.getElementById("orgCheck") as HTMLInputElement
    if (orgBox?.checked) {
      setOrgFilter(true)
      setNotificationsDisplayed([])
    } else {
      setOrgFilter(false)
      setNotificationsDisplayed([])
    }
  }

  const onBillFilterChange = () => {
    const billBox = document.getElementById("billCheck") as HTMLInputElement
    if (billBox?.checked) {
      setBillFilter(true)
      setNotificationsDisplayed([])
    } else {
      setBillFilter(false)
      setNotificationsDisplayed([])
    }
  }

  const notificationQuery = async () => {
    const q = query(subscriptionRef, where("uid", "==", `${uid}`))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      notificationList.push(doc.data().notification)
    })

    if (orgFilter === false) {
      notificationList = notificationList.filter(
        notification => notification.type !== "org"
      )
    }

    if (billFilter === false) {
      notificationList = notificationList.filter(
        notification => notification.type !== "bill"
      )
    }

    if (notificationsDisplayed.length === 0 && notificationList.length != 0) {
      setNotificationsDisplayed(notificationList)
    }
  }

  useEffect(() => {
    uid ? notificationQuery() : null
  })

  function Filters() {
    return (
      <FilterBoxs
        isMobile={isMobile}
        orgFilter={orgFilter}
        onOrgFilterChange={onOrgFilterChange}
        billFilter={billFilter}
        onBillFilterChange={onBillFilterChange}
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
                <div>Pagination Element</div>
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

function FilterBoxs({
  isMobile,
  orgFilter,
  onOrgFilterChange,
  billFilter,
  onBillFilterChange
}: {
  isMobile: boolean
  orgFilter: boolean
  onOrgFilterChange: any
  billFilter: boolean
  onBillFilterChange: any
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
            value=""
            id="orgCheck"
            onChange={e => {
              onOrgFilterChange()
            }}
            checked={orgFilter}
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
            value=""
            id="billCheck"
            onChange={e => {
              onBillFilterChange()
            }}
            checked={billFilter}
          />
          <label className="form-check-label" htmlFor="billCheck">
            Bill Updates
          </label>
        </div>
      </Row>
    </>
  )
}
