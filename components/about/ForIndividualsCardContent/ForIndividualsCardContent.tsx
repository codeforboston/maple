import { Row, Col } from "../../bootstrap"
import { SignInWithButton } from "../../auth"
import { useTranslation } from "next-i18next"

const WhyMAPLECardContent = () => {
  const { t } = useTranslation("forindividuals")
  return (
    <>
      <h3 className={`text-right fw-bold mt-3 text-primary`}>
        {t("callToAction.title")}
      </h3>
      <p>{t("callToAction.bodytext")}</p>
    </>
  )
}

const BenefitsCardContent = () => {
  const { t } = useTranslation("forindividuals")
  return (
    <>
      <h3 className={`text-left fw-bold mb-4 text-info`}>
        {t("benefits.youMatter.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.youMatter.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 text-info`}>
        {t("benefits.multipleSides.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.multipleSides.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 text-info`}>
        {t("benefits.trustedOrgs.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.trustedOrgs.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 text-info`}>
        {t("benefits.anyLanguage.title")}
      </h3>
      <Row className="mb-3">
        <Col>
          <p>{t("benefits.anyLanguage.bodytext")}</p>
        </Col>
      </Row>

      <h3 className={`text-left fw-bold mb-4 text-info`}>
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
  const { t } = useTranslation("forindividuals")
  return (
    <>
      <h3 className={`text-left fw-bold mb-4 text-info`} id="clo">
        {t("challenge.title")}
      </h3>
      <p>{t("challenge.bodytextOne")}</p>
      <p>{t("challenge.bodytextTwo")}</p>
      <h3 className={`text-left fw-bold mb-4 text-info`} id="clo">
        <div>
          <SignInWithButton label={t("challenge.signUp")} />
        </div>
      </h3>
      <h3 className={`text-right fw-bold mt-3 text-primary`}>
        <a href="mailto:info@mapletestimony.org">{t("challenge.contact")}</a>
      </h3>
    </>
  )
}

export { WhyMAPLECardContent, BenefitsCardContent, ChallengeCardContent }
