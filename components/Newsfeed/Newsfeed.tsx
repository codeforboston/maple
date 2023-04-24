import {
  collection,
  deleteDoc,
  doc,
  query,
  where,
  getDocs
} from "firebase/firestore"
import ErrorPage from "next/error"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Col, Row, Spinner } from "../bootstrap"
import {
  ProfileMember,
  usePublicProfile,
  usePublishedTestimonyListing
} from "../db"
import { firestore } from "../firebase"
import { Banner } from "../shared/StyledSharedComponents"
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

  console.log("Notif List: ", notificationsDisplayed)

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
                      {element.type}
                      <AlertCard
                        header={element.header}
                        subheader={element.subheader}
                        timestamp={element.timestamp}
                        headerImgSrc={`${
                          profile.profileImage
                            ? profile.profileImage
                            : "/profile-org-white.svg"
                        }`}
                        bodyImgSrc={``}
                        bodyImgAltTxt={``}
                        bodyText={element.bodyText}
                      />
                    </div>
                  )
                )}
                <div className="pb-4">
                  <AlertCard
                    header={`Green Sustainability`}
                    subheader={``}
                    timestamp={`5:30PM`}
                    headerImgSrc={`${
                      profile.profileImage
                        ? profile.profileImage
                        : "/profile-org-white.svg"
                    }`}
                    bodyImgSrc={``}
                    bodyImgAltTxt={``}
                    bodyText={`Green Sustainability released a testimony on S.1958 at https://digital-testimony-dev.web.app/bill?id=S1958.`}
                  />
                </div>
                <div className="pb-4">
                  <AlertCard
                    header={`H.3340`}
                    subheader={`An Act creating a green back to promote clean energy in Massachusetts`}
                    timestamp={`5:30PM`}
                    headerImgSrc={``}
                    bodyImgSrc={``}
                    bodyImgAltTxt={``}
                    bodyText={`The reporting date was extended to Thursday June 30, 2022, pending concurrence.`}
                  />
                </div>
                <div>Pagination</div>
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

/**
 * map array -> display bill/org element
 *
 * filter for bills/orgs
 *
 * format timestamp
 *
 * pagination
 *
 */
