import { collection, query, where, getDocs } from "firebase/firestore"
import ErrorPage from "next/error"
import { useCallback, useEffect, useState } from "react"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import {
  Button,
  Col,
  Image,
  Overlay,
  OverlayTrigger,
  Row,
  Spinner
} from "../bootstrap"
import { usePublicProfile } from "../db"
import { firestore } from "../firebase"
import {
  Header,
  HeaderTitle,
  StyledContainer
} from "./StyledNewsfeedComponents"
import { AlertCard } from "components/AlertCard/AlertCard"

type ElementProps = {
  bodyText: string
  court: string
  header: string
  id: string
  subheader: string
  timestamp: string
  topicName: string
  type: string
}

type Props = ElementProps[]

export default function Newsfeed() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  const { user } = useAuth()
  const { result: profile, loading } = usePublicProfile(user?.uid)
  const uid = user?.uid
  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/userNotificationFeed/`
  )

  const [orgFilter, setOrgFilter] = useState<boolean>(true)
  const [billFilter, setBillFilter] = useState<boolean>(true)

  const [allResults, setAllResults] = useState<Props>([])
  const [orgResults, setOrgResults] = useState<Props>([])
  const [billResults, setBillResults] = useState<Props>([])

  const [notificationsDisplay, setNotificationsDisplay] = useState<Props>([])
  const [noDisplay, setNoDisplay] = useState<boolean>(true)

  const onFilterChange = (trolley: string, boxType: string) => {
    const Box = document.getElementById(boxType) as HTMLInputElement
    if (Box?.checked) {
      trolley ? setOrgFilter(true) : setBillFilter(true)
    } else {
      trolley ? setOrgFilter(false) : setBillFilter(false)
    }
  }

  const checkDisplay = useCallback(() => {
    setNoDisplay(false)
    if (orgFilter == true && billFilter == true) {
      return setNotificationsDisplay(allResults)
    } else if (orgFilter == true) {
      return setNotificationsDisplay(orgResults)
    } else if (billFilter == true) {
      return setNotificationsDisplay(billResults)
    }
    return setNoDisplay(true)
  }, [allResults, orgFilter, orgResults, billFilter, billResults])

  const notificationQuery = async () => {
    let notificationList: Props = []
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

  useEffect(() => {
    checkDisplay()
  }, [checkDisplay, orgFilter, billFilter, notificationsDisplay])

  function Filters() {
    return (
      <FilterBoxs
        isMobile={isMobile}
        onFilterChange={onFilterChange}
        orgFilter={orgFilter}
        billFilter={billFilter}
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
                {noDisplay ? (
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
                ) : (
                  <>
                    {notificationsDisplay.map(
                      (element: ElementProps, index: number) => (
                        <div className="pb-4" key={index}>
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
                      )
                    )}
                  </>
                )}
                <Col className="d-none">
                  <Button>
                    <Image src="/chevrons-left.svg" alt="left select" />
                  </Button>
                  <div>Pagination Element</div>
                  <Button>
                    <Image src="/chevrons-right.svg" alt="right select" />
                  </Button>
                </Col>
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
  onFilterChange,
  orgFilter,
  billFilter
}: {
  isMobile: boolean
  onFilterChange: any
  orgFilter: boolean
  billFilter: boolean
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
              onFilterChange("non-empty", "orgCheck")
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
              onFilterChange("", "billCheck")
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
