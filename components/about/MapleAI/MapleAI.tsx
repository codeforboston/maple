import { Container, Row, Col } from "../../bootstrap"
import AboutPagesCard from "../../AboutPagesCard/AboutPagesCard"
import { useTranslation } from "next-i18next"

import {
  MemberItem,
  Divider,
  DescrContainer,
  PageTitle,
  PageDescr,
  SectionContainer,
  SectionTitle
} from "../../shared/CommonComponents"

const MapleAI = () => {
  const { t } = useTranslation("mapleAI")

  return (
    <Container>
      <Row>
        <Col>
          <PageTitle>{t("title")}</PageTitle>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <PageDescr>{t("mission-statement")}</PageDescr>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">{t("section1")}</SectionTitle>
            <DescrContainer className="py-3 px-4">test</DescrContainer>
            <DescrContainer className="pb-3 px-4">test 2</DescrContainer>
            <DescrContainer className="pb-3 px-4">test 3</DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">{t("section2")}</SectionTitle>
            <DescrContainer className="py-3 px-4">test</DescrContainer>
            <DescrContainer className="pb-3 px-4">test 2</DescrContainer>
            <DescrContainer className="pb-3 px-4">test 3</DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
    </Container>
  )
}

export default MapleAI
