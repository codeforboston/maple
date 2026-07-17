import { useTranslation } from "next-i18next"
import { Col, Row, Container } from "../bootstrap"
import { MemberItem, Divider, PageDescr } from "../shared/CommonComponents"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"

export const SteeringCommittee = () => {
  const { t } = useTranslation("our-team")

  return (
    <Container>
      <PageDescr className="py-3">{t("steering.desc")}</PageDescr>
      <Row>
        <Col className="my-3">
          <AboutPagesCard title={t("steering.section1Title")}>
            <MemberItem
              name="Matthew Victor"
              email="mvictor@mapletestimony.org"
              descr={t("steering.MVictor")}
            />
            <Divider />
            <MemberItem
              name="Nathan Sanders"
              email="nsanders@mapletestimony.org"
              descr={t("steering.NSanders")}
            />
            <Divider />
            <MemberItem name="Anna Steele" descr={t("steering.ASteele")} />
            <Divider />
            <MemberItem name="Dan Jackson" descr={t("steering.DJackson")} />
            <Divider />
            <MemberItem name="John Griffin" descr={t("steering.JGriffin")} />
            <Divider />
            <MemberItem
              name="Elaine Almquist"
              descr={t("steering.EAlmquist")}
            />
          </AboutPagesCard>
        </Col>
      </Row>
      <Row>
        <Col className="my-3">
          <AboutPagesCard title={t("steering.section2Title")}>
            <MemberItem name="James Vasquez" descr={t("steering.JVasquez")} />
            <Divider />
            <MemberItem name="Matt King" descr={t("steering.MKing")} />
            <Divider />
            <MemberItem name="Merritt Baggett" descr={t("steering.MBaggett")} />
            <Divider />
            <MemberItem name="Kimin Kim" descr={t("steering.KKim")} />
            <Divider />
            <MemberItem name="Minqi Chai" descr={t("steering.MChai")} />
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}
