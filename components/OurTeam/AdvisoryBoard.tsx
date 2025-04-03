import { useTranslation } from "next-i18next"
import { Col, Row, Container } from "../bootstrap"
import {
  MemberItem,
  PageTitle,
  PageDescr,
  SectionContainer,
  Divider
} from "../shared/CommonComponents"

export const AdvisoryBoard = () => {
  const { t } = useTranslation("our-team")

  return (
    <Container>
      <Row>
        <Col>
          <PageTitle>{t("advisory.title")}</PageTitle>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <PageDescr>{t("advisory.desc")}</PageDescr>
        </Col>
      </Row>
      <Row>
        <Col className="my-3">
          <SectionContainer className="py-1">
            <MemberItem name="David Fields" descr={t("advisory.DFields")} />
            <Divider />
            <MemberItem name="John Griffin" descr={t("advisory.JGriffin")} />
            <Divider />
            <MemberItem name="Marci Harris" descr={t("advisory.MHarris")} />
            <Divider />
            <MemberItem
              name="Jake Hirsh-Allen"
              descr={t("advisory.JakeHirshAllen")}
            />
            <Divider />
            <MemberItem name="Matt Prewitt" descr={t("advisory.MPrewitt")} />
            <Divider />
            <MemberItem name="James Turk" descr={t("advisory.JTurk")} />
            <Divider />
            <MemberItem name="Harlan Weber" descr={t("advisory.HWeber")} />
          </SectionContainer>
        </Col>
      </Row>
    </Container>
  )
}
