import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import { SignInWithButton } from "../auth"
import { useTranslation } from "next-i18next"
import { useAuth } from "components/auth"
import styled from "styled-components"

const OurGoalsImage = styled(Image)`
  height: 8rem;
`
const MissionImage = styled(Image)`
  @media (max-width: 36em) {
    height: 5.625rem;
  }
`
const StepsImage = styled(Image)`
  @media (max-width: 36em) {
    height: 7.375rem;
  }
`

const OurGoalsCardContent = () => {
  const { t } = useTranslation("goalsandmission")
  return (
    <>
      <h5 className="text-center fw-bold fs-sm-2 tracking-tight pb-3 pb-sm-4">
        {t("goals.overview")}
      </h5>
      <Row className="mb-4">
        <Col md={6}>
          <figure className="text-center mb-3">
            <OurGoalsImage fluid src="/gov-with-key.svg" alt="" />
            <figcaption className="text-align-center text-align-sm-start fs-5 fw-bold mt-3">
              {t("goals.increase")}
            </figcaption>
          </figure>
        </Col>

        <Col md={6}>
          <figure className="text-center mb-3">
            <OurGoalsImage
              fluid
              src="/doc-with-arrows-from-people.svg"
              alt=""
            />
            <figcaption className="text-align-center text-align-sm-start fs-5 fw-bold mt-3">
              {t("goals.engage")}
            </figcaption>
          </figure>
        </Col>
      </Row>

      <Row>
        <Col xs={{ span: 12, order: 2 }} md={{ span: 6, order: 1 }}>
          <figure className="text-center mb-3">
            <OurGoalsImage fluid src="/doc-with-arrows-to-people.svg" alt="" />
            <figcaption className="text-align-center text-align-sm-start fs-5 fw-bold mt-3">
              {t("goals.strengthen")}
            </figcaption>
          </figure>
        </Col>

        <Col xs={{ span: 12, order: 1 }} md={{ span: 6, order: 1 }}>
          <figure className="text-center mb-3">
            <OurGoalsImage fluid src="/gov-with-key.svg" alt="" />
            <figcaption className="text-align-center text-align-sm-start fs-5 fw-bold mt-3">
              {t("goals.encourage")}
            </figcaption>
          </figure>
        </Col>
      </Row>
    </>
  )
}

const OurMissionCardContent = () => {
  const { t } = useTranslation("goalsandmission")
  const { authenticated } = useAuth()

  return (
    <>
      <h5 className="text-center fw-bold fs-sm-2 tracking-tight pb-3 pb-sm-4">
        {t("mission.overview")}
      </h5>
      <Row className="mb-4">
        <Col xs={{ span: 12, order: 2 }} md={{ span: 6, order: 1 }} lg={8}>
          <p className="fs-6 fs-sm-5 tracking-tight text-start lh-sm pt-4 pb-3 pb-sm-4 p-md-0">
            {t("mission.connect")}
          </p>
        </Col>
        <Col
          xs={{ span: 12, order: 1 }}
          md={{ span: 6, order: 2 }}
          lg={4}
          className={`text-center`}
        >
          <MissionImage fluid src="/leg-with-mag-glass.svg" alt="" />
        </Col>
      </Row>

      <Row>
        <Col
          sm={{ span: 12, order: 1 }}
          md={{ span: 6, order: 1 }}
          lg={4}
          className="text-center"
        >
          <MissionImage fluid src="/doc-treasure-box.svg" alt="" />
        </Col>
        <Col
          sm={{ span: 12, order: 2 }}
          md={{ span: 6, order: 1 }}
          lg={8}
          className={`fs-6 fs-sm-5 tracking-tight text-start lh-sm pt-4 pb-3 pb-sm-4 p-md-0`}
        >
          <p>{t("mission.disclosure")}</p>
        </Col>
      </Row>
      <Row>
        <Col
          className={`p-3 fs-6 fs-sm-5 tracking-tight text-start lh-sm pt-4 pb-3 pb-sm-4`}
        ></Col>
      </Row>
      <Row>
        <Col>
          <p
            className={`bg-secondary text-white my-n3 my-lg-0 mx-n4 py-4 px-3 fs-6 fs-sm-5 tracking-tight text-start lh-sm pt-4 pb-3 pb-sm-4`}
          >
            {t("mission.publish1")}
          </p>
          <p
            className={`bg-secondary text-white my-n3 my-lg-0 mx-n4 py-4 px-3 fs-6 fs-sm-5 tracking-tight text-start lh-sm pt-4 pb-3 pb-sm-4`}
          >
            {t("mission.publish2")}
          </p>
        </Col>
      </Row>

      {!authenticated && (
        <>
          <Row className="text-center">
            <Col>
              <h3 className="fw-bold mt-3 text-primary">
                {t("mission.submit_now")}
              </h3>
            </Col>
          </Row>

          <Row className="text-center mb-3">
            <Col>
              <SignInWithButton />
            </Col>
          </Row>
        </>
      )}
    </>
  )
}

export { OurGoalsCardContent, OurMissionCardContent }
