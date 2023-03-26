import { Row, Col } from "../../bootstrap"
import Image from "react-bootstrap/Image"
import styles from "./ForTestifiersCardContent.module.css"
import { SignInWithButton } from "../../auth"
import Link from "next/link"
import { useTranslation } from "next-i18next"

const WhyMAPLECardContent = () => {
  const { t } = useTranslation("fortestifiers")
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
  const { t } = useTranslation("fortestifiers")
  return (
    <>
      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.youMatter.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.youMatter.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.multipleSides.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.multipleSides.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.trustedOrgs.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.trustedOrgs.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.anyLanguage.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.anyLanguage.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`}>
        {t("benefits.stayInformed.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.stayInformed.bodytext")}</p>
        </Col>
      </Row>
    </>
  )
}

const ChallengeCardContent = () => {
  const { t } = useTranslation("fortestifiers")
  return (
    <>
      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`} id="clo">
        {t("challenge.title")}
      </h3>
      <p>{t("challenge.bodytextOne")}</p>
      <p>{t("challenge.bodytextTwo")}</p>
      <h3 className={`text-left fw-bold mb-4 ${styles.orgsheader}`} id="clo">
        <div className={styles.btncontainer}>
          <SignInWithButton label={t("challenge.signUp")} />
        </div>
      </h3>
      <h3 className={`text-right fw-bold mt-3 ${styles.calltoaction}`}>
        <a href="mailto:mapletestimony@gmail.com">{t("challenge.contact")}</a>
      </h3>
    </>
  )
}

export { WhyMAPLECardContent, BenefitsCardContent, ChallengeCardContent }
