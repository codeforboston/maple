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
            <SectionTitle className="p-2">{t("section1.title")}</SectionTitle>
            <DescrContainer className="py-3 px-4">
              {t("section1.desc1")}
            </DescrContainer>
            <DescrContainer className="pb-1 px-4">
              <ul>
                <li className="pb-3">
                  <b>{t("section1.desc2Bold")}</b> {t("section1.desc2Main")}
                </li>
                <li>
                  <b>{t("section1.desc3Bold")}</b> {t("section1.desc3Main")}
                </li>
                <li>
                  <b>{t("section1.desc4Bold")}</b> {t("section1.desc4Main")}
                </li>
              </ul>
            </DescrContainer>
            <DescrContainer className="pb-3 px-4">
              <b>{t("legal-advisory")}</b>
            </DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">{t("section2.title")}</SectionTitle>
            <MemberItem
              name={t("section2.desc1Title")}
              descr={t("section2.desc1Main")}
            />
            <Divider />
            <MemberItem
              name={t("section2.desc2Title")}
              descr={t("section2.desc2Main")}
            />
            <Divider />
            <MemberItem
              name={t("section2.desc3Title")}
              descr={t("section2.desc3Main")}
            />
            <Divider />
            <MemberItem
              name={t("section2.desc4Title")}
              descr={t("section2.desc4Main")}
            />
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">{t("section3.title")}</SectionTitle>
            <MemberItem
              name={t("section3.desc1Title")}
              descr={t("section3.desc1Main")}
            />
            <DescrContainer className="pb-3 px-4">
              <b>{t("legal-advisory")}</b>
            </DescrContainer>
            <Divider />
            <MemberItem
              name={t("section3.desc2Title")}
              descr={t("section3.desc2Main")}
            />
            <Divider />
            <NameContainer className="py-3 px-4">
              {t("section3.desc3Title")}
            </NameContainer>
            <DescrContainer className="pb-3 px-4">
              {t("section3.desc3Pre")} <i>{t("section3.desc3Italic")}</i>{" "}
              {t("section3.desc3Main")}
            </DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">{t("section4.title")}</SectionTitle>
            <NameContainer className="py-3 px-4">
              {t("section4.sub1.title")}
            </NameContainer>
            <DescrContainer className="pb-3 px-4">
              {t("section4.sub1.desc1")}
            </DescrContainer>
            <DescrContainer className="pb-3 px-4">
              {t("section4.sub1.desc2")}
            </DescrContainer>
            <DescrContainer className="pb-1 px-4">
              <ul>
                <li className="pb-3">
                  <b>{t("section4.sub1.desc3Bold")}</b>{" "}
                  {t("section4.sub1.desc3Main")}
                </li>
                <li className="pb-3">
                  <b>{t("section4.sub1.desc4Bold")}</b>{" "}
                  {t("section4.sub1.desc4Main")}
                </li>
                <li>
                  <b>{t("section4.sub1.desc5Bold")}</b>{" "}
                  {t("section4.sub1.desc5Main")}
                </li>
                <li>
                  <b>{t("section4.sub1.desc6Bold")}</b>{" "}
                  {t("section4.sub1.desc6Main")}
                </li>
              </ul>
            </DescrContainer>
            <Divider />
            <NameContainer className="py-3 px-4">
              {t("section4.sub2.title")}
            </NameContainer>
            <DescrContainer className="pb-1 px-4">
              <ul>
                <li className="pb-3">
                  <b>{t("section4.sub2.desc1Bold")}</b>{" "}
                  {t("section4.sub2.desc1Main")}
                </li>
                <li className="pb-3">
                  <b>{t("section4.sub2.desc2Bold")}</b>{" "}
                  {t("section4.sub2.desc2Main")}
                </li>
                <li>
                  <b>{t("section4.sub2.desc3Bold")}</b>{" "}
                  {t("section4.sub2.desc3Main")}
                </li>
              </ul>
            </DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">{t("section5.title")}</SectionTitle>
            <DescrContainer className="py-3 px-4">
              {t("section5.desc1")}
            </DescrContainer>
            <DescrContainer className="pb-1 px-4">
              <ul>
                <li className="pb-3">
                  <b>{t("section5.desc2Bold")}</b> {t("section5.desc2Main")}
                </li>
                <li className="pb-3">
                  <b>{t("section5.desc3Bold")}</b> {t("section5.desc3Main")}
                </li>
                <li>
                  <b>{t("section5.desc4Bold")}</b> {t("section5.desc4Main")}
                </li>
              </ul>
            </DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
    </Container>
  )
}

export default MapleAI
