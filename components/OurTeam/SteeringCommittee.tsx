import { useTranslation } from "next-i18next"
import { Col, Row, Container } from "../bootstrap"
import {
  MemberItem,
  Divider,
  PageTitle,
  PageDescr,
  SectionContainer,
  SectionTitle
} from "../shared/CommonComponents"

export const SteeringCommittee = () => {
  const { t } = useTranslation("our-team")

  return (
    <Container>
      <Row>
        <Col>
          <PageTitle>{t("steering.title")}</PageTitle>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <PageDescr></PageDescr>
        </Col>
      </Row>
      <Row>
        <Col className="my-3">
          <SectionContainer>
            <SectionTitle className="p-2">
              {t("steering.section1Title")}
            </SectionTitle>
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
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="my-3">
          <SectionContainer>
            <SectionTitle className="p-2">
              {t("steering.section2Title")}
            </SectionTitle>
            <MemberItem name="James Vasquez" descr={t("steering.JVasquez")} />
            <Divider />
            <MemberItem name="Matt King" descr={t("steering.MKing")} />
            <Divider />
            <MemberItem name="Merritt Baggett" descr={t("steering.MBaggett")} />
            <Divider />
            <MemberItem name="Kimin Kim" descr={t("steering.KKim")} />
            <Divider />
            <MemberItem name="Minqi Chai" descr={t("steering.MChai")} />
          </SectionContainer>
        </Col>
      </Row>
    </Container>
  )
}
