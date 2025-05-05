import { useTranslation } from "next-i18next"
import { Container, Row, Col } from "../../bootstrap"
import {
  MemberItem,
  Divider,
  DescrContainer,
  NameContainer,
  PageTitle,
  PageDescr,
  SectionContainer,
  SectionTitle
} from "../../shared/CommonComponents"

const Testimony21stCentury = () => {
  const { t } = useTranslation("testimony21stCentury")

  return (
    <Container>
      <Row>
        <Col>
          <PageTitle>{t("title")}</PageTitle>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2"></SectionTitle>
            <DescrContainer className="py-3 px-4">
              {t("section1.desc1")}
            </DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">{t("section2.title")}</SectionTitle>
            <DescrContainer className="py-3 px-4">
              {t("section2.desc1Main")}
            </DescrContainer>
            {/* <MemberItem
              name={t("section2.desc1Title")}
              descr={t("section2.desc1Main")}
            />
            <Divider /> */}
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">{t("section3.title")}</SectionTitle>
            <DescrContainer className="pb-3 px-4">
              {t("section3.desc1Main")}
            </DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">{t("section4.title")}</SectionTitle>
            <DescrContainer className="pb-3 px-4">
              {t("section4.desc1Main")}
            </DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">{t("section5.title")}</SectionTitle>
            <DescrContainer className="pb-3 px-4">
              {t("section5.desc1Main")}
            </DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">{t("section6.title")}</SectionTitle>
            <DescrContainer className="pb-3 px-4">
              {t("section6.desc1Main")}
            </DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">{t("section7.title")}</SectionTitle>
            <DescrContainer className="pb-3 px-4">
              {t("section7.desc1Main")}
            </DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">{t("section8.title")}</SectionTitle>
            <DescrContainer className="pb-3 px-4">
              {t("section8.desc1Main")}
            </DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
    </Container>
  )
}

export default Testimony21stCentury
