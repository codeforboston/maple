import ErrorPage from "next/error"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Col, Row, Spinner } from "../bootstrap"
import {
  ProfileMember,
  usePublicProfile,
  usePublishedTestimonyListing
} from "../db"
import { Banner } from "../shared/StyledSharedComponents"
import {
  Header,
  HeaderTitle,
  StyledContainer
} from "./StyledNewsfeedComponents"
import { AlertCard } from "components/AlertCard/AlertCard"

export default function Newsfeed() {
  const { user } = useAuth()
  const { result: profile, loading } = usePublicProfile(user?.uid)

  const isMobile = useMediaQuery("(max-width: 768px)")

  console.log("P:", profile)
  console.log("U:", user)

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
