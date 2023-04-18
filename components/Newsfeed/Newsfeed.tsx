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

  const header = {
    header: "Green Sustainability",
    subheader: "",
    timestamp: "5:30PM",
    imgSrc: ""
  }

  const body = {
    imgSrc: "",
    imgAltTxt: "",
    text: ""
  }

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
                <AlertCard
                  header={`Green Sustainability`}
                  subheader={`test`}
                  timestamp={`5:30PM`}
                  headerImgSrc={``}
                  bodyImgSrc={``}
                  bodyImgAltTxt={``}
                  bodyText={`body test`}
                />
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
