import { useTranslation } from "next-i18next"
import Link from "next/link"
import { SignInWithButton } from "../../auth"
import { Col, Row } from "../../bootstrap"
import { useAuth } from "../../auth"
import styles from "./ForOrgsCardContent.module.css"

const WhyMAPLECardContent = () => {
  const { t } = useTranslation("fororgs")
  return (
    <>
      <h3 className={`text-right fw-bold mt-3 ${styles.calltoaction}`}>
        {t("callToAction.title")}
      </h3>
      <p>{t("callToAction.bodytext")}</p>
    </>
  )
}

const BenefitsCardContent = () => {
  const { t } = useTranslation("fororgs")
  const { authenticated } = useAuth()

  return (
    <>
      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.reach.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.reach.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.connect.title")}
      </h3>
      <Row className="mb-3">
        <Col>{t("benefits.connect.bodytext")}</Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.language.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.language.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.coordinate.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.coordinate.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.seeEveryone.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.seeEveryone.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.curateHistory.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.curateHistory.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.legislativeResearch.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>
            {t("benefits.legislativeResearch.bodytext1")}{" "}
            <Link href="/bills">
              <a>{t("benefits.legislativeResearch.linkText")}</a>
            </Link>{" "}
            {t("benefits.legislativeResearch.bodytext2")}
          </p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.changeNorms.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.changeNorms.bodytext")}</p>
        </Col>
      </Row>

      {!authenticated && (
        <>
          <Row className="text-center">
            <Col>
              <h3 className={`fw-bold mt-3 ${styles.calltoaction}`}>
                {t("benefits.signUp")}
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

const ChallengeCardContent = () => {
  const { t } = useTranslation("fororgs")
  return (
    <>
      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`} id="clo">
        {t("challenge.title")}
      </h3>
      <p>{t("challenge.p1")}</p>
      <p>{t("challenge.p2")} </p>
      <p>{t("challenge.p3")} </p>
      <h3 className={`text-right fw-bold mt-3 ${styles.calltoaction}`}>
        <a href="mailto:mapletestimony@gmail.com">
          {t("challenge.callToAction")}
        </a>
      </h3>
    </>
  )
}

export { WhyMAPLECardContent, BenefitsCardContent, ChallengeCardContent }
