import { Row, Col } from "../bootstrap"
import Image from "react-bootstrap/Image"
import { SignInWithButton } from "../auth"
import * as links from "../links"
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

// Goal captions with tighter line spacing than the body default. (Utility
// classes on the element still handle alignment/size/weight/spacing.)
const GoalCaption = styled.figcaption`
  line-height: 1.2;
`

// Closing call-to-action at the bottom of the mission card: a centered headline,
// lede, a primary sign-in pill and a secondary outlined link.
const Cta = styled.div`
  margin-top: 2.5rem;
  padding-bottom: 1.5rem;
  text-align: center;

  h2 {
    font-family: var(--maple-font-heading);
    font-weight: 900;
    color: var(--bs-blue);
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .lede {
    color: var(--maple-text-body);
    line-height: 1.65;
    max-width: 34rem;
    margin: 0 auto 1.5rem;
  }

  .cta-action,
  a.cta-action,
  button.cta-action {
    display: inline-block;
    width: auto !important;
    padding: var(--maple-space-sm) var(--maple-space-xl);
    border-radius: var(--maple-radius-pill);
    background: var(--maple-brand-primary) !important;
    border: 2px solid var(--maple-brand-primary) !important;
    color: var(--maple-text-inverse) !important;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
  }

  .cta-action:hover,
  a.cta-action:hover,
  button.cta-action:hover {
    background: var(--maple-brand-primary-strong) !important;
    border-color: var(--maple-brand-primary-strong) !important;
    color: var(--maple-text-inverse) !important;
  }

  .cta-action-wrap {
    display: inline-block;
  }

  .cta-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
  }

  /* Secondary action: the same pill, outlined rather than filled. */
  .cta-action-secondary,
  a.cta-action-secondary {
    background: transparent !important;
    color: var(--maple-brand-primary) !important;
  }

  .cta-action-secondary:hover,
  a.cta-action-secondary:hover {
    background: var(--maple-brand-primary) !important;
    color: var(--maple-text-inverse) !important;
  }
`

const OurGoalsCardContent = () => {
  const { t } = useTranslation("goalsandmission")
  return (
    <>
      <h5 className="text-center fw-bold tracking-tight pb-3 pb-sm-4">
        {t("goals.overview")}
      </h5>
      <Row className="mb-4">
        <Col md={6}>
          <figure className="text-center mb-3">
            <OurGoalsImage fluid src="/gov-with-key.svg" alt="" />
            <GoalCaption className="text-align-center text-align-sm-start fs-6 fw-bold mt-3 px-3">
              {t("goals.increase")}
            </GoalCaption>
          </figure>
        </Col>

        <Col md={6}>
          <figure className="text-center mb-3">
            <OurGoalsImage
              fluid
              src="/doc-with-arrows-from-people.svg"
              alt=""
            />
            <GoalCaption className="text-align-center text-align-sm-start fs-6 fw-bold mt-3 px-3">
              {t("goals.engage")}
            </GoalCaption>
          </figure>
        </Col>
      </Row>

      <Row>
        <Col xs={{ span: 12, order: 2 }} md={{ span: 6, order: 1 }}>
          <figure className="text-center mb-3">
            <OurGoalsImage fluid src="/doc-with-arrows-to-people.svg" alt="" />
            <GoalCaption className="text-align-center text-align-sm-start fs-6 fw-bold mt-3 px-3">
              {t("goals.strengthen")}
            </GoalCaption>
          </figure>
        </Col>

        <Col xs={{ span: 12, order: 1 }} md={{ span: 6, order: 1 }}>
          <figure className="text-center mb-3">
            <OurGoalsImage fluid src="/gov-with-key.svg" alt="" />
            <GoalCaption className="text-align-center text-align-sm-start fs-6 fw-bold mt-3 px-3">
              {t("goals.encourage")}
            </GoalCaption>
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
      <h5 className="text-center fw-bold tracking-tight pb-3 pb-sm-4">
        {t("mission.overview")}
      </h5>
      <Row className="mb-0">
        <Col xs={{ span: 12, order: 2 }} md={{ span: 6, order: 1 }} lg={8}>
          <p
            className="fs-6 text-start lh-sm p-3 p-md-4"
            style={{ letterSpacing: "0.005em", fontSize: "0.875rem" }}
          >
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
          className={`fs-6 text-start lh-sm p-3 p-md-4`}
          style={{ letterSpacing: "0.005em", fontSize: "0.875rem" }}
        >
          <p>
            {t("mission.disclosure")}
            <links.External
              href={`https://malegislature.gov/PressRoom/Detail?pressReleaseId=214`}
            >
              {t("mission.disclosureLink")}
            </links.External>
            {t("mission.disclosure2")}
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <div
            className="bg-secondary text-white my-n3 my-lg-0 mx-n4 fs-6 text-start lh-sm"
            style={{
              fontWeight: 700,
              letterSpacing: "0.02em",
              padding: "2.5rem 3rem"
            }}
          >
            <p className="mb-2">{t("mission.publish1")}</p>
            <p className="mb-0">{t("mission.publish2")}</p>
          </div>
        </Col>
      </Row>

      {!authenticated && (
        <Cta>
          <h2>{t("mission.ctaHeadline")}</h2>
          <p className="lede">{t("mission.ctaBody")}</p>
          <div className="cta-buttons">
            <SignInWithButton
              className="cta-action-wrap"
              buttonClassName="cta-action"
            />
            <links.Internal
              className="cta-action cta-action-secondary"
              href="/why-use-maple/for-individuals"
            >
              {t("mission.ctaSecondary")}
            </links.Internal>
          </div>
        </Cta>
      )}
    </>
  )
}

export { OurGoalsCardContent, OurMissionCardContent }
