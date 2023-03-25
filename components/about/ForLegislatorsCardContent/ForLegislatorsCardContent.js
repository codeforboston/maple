import { Row, Col } from "../../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./ForLegislatorsCardContent.module.css"
import { SignInWithButton } from "../../auth"
import Link from "next/link"
import { useTranslation } from "next-i18next"

const WhyMAPLECardContent = () => {
  const { t } = useTranslation("forlegislators")
  return (
    <>
      <h3 className={`text-right fw-bold mt-3 ${styles.calltoaction}`}>
        {t("callToAction.title")}
      </h3>
      <p>{t("callToAction.bodytextOne")}</p>
      <p>{t("callToAction.bodytextTwo")}</p>
    </>
  )
}

const BenefitsCardContent = () => {
  const { t } = useTranslation("forlegislators")
  return (
    <>
      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.constituents.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.constituents.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.seeTestimony.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.seeTestimony.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.simplifyTestimony.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.simplifyTestimony.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.languageAccess.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.languageAccess.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.advancedStatistics.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.advancedStatistics.bodytext")}</p>
        </Col>
      </Row>
    </>
  )
}

const ChallengeCardContent = () => {
  const { t } = useTranslation("forlegislators")
  return (
    <>
      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`} id="clo">
        {t("challenge.title")}
      </h3>
      <p>{t("challenge.bodytext")}</p>
      <h3 className={`text-right fw-bold mt-3 ${styles.calltoaction}`}>
        <a href="mailto:mapletestimony@gmail.com">{t("challenge.contact")}</a>
      </h3>
    </>
  )
}

export { WhyMAPLECardContent, BenefitsCardContent, ChallengeCardContent }
