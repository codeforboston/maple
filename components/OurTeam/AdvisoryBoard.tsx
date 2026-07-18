import { useTranslation } from "next-i18next"
import { Col, Row, Container } from "../bootstrap"
import { MemberItem, Divider, PageDescr } from "../shared/CommonComponents"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"

export const AdvisoryBoard = () => {
  const { t } = useTranslation("our-team")

  return (
    <Container>
      <PageDescr className="py-3">{t("advisory.desc")}</PageDescr>
      <Row>
        <Col>
          <AboutPagesCard title={t("advisory.title")}>
            <MemberItem name="David Fields" descr={t("advisory.DFields")} />
            <Divider />
            <MemberItem name="Jerren Chang" descr={t("advisory.JChang")} />
            <Divider />
            <MemberItem name="Marci Harris" descr={t("advisory.MHarris")} />
            <Divider />
            <MemberItem
              name="Jake Hirsch-Allen"
              descr={t("advisory.JakeHirshAllen")}
            />
            <Divider />
            <MemberItem name="Matt Prewitt" descr={t("advisory.MPrewitt")} />
            <Divider />
            <MemberItem name="James Turk" descr={t("advisory.JTurk")} />
            <Divider />
            <MemberItem name="Harlan Weber" descr={t("advisory.HWeber")} />
            <Divider />
            <MemberItem name="Liz Barry" descr={t("advisory.LBarry")} />
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}
