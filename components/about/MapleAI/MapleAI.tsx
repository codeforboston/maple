import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Container, Row, Col } from "../../bootstrap"
import { Internal } from "../../links"
import {
  MemberItem,
  Divider,
  DescrContainer,
  NameContainer,
  SectionContainer,
  SectionTitle
} from "../../shared/CommonComponents"
import LearnBreadcrumb from "../../learn/LearnBreadcrumb"
import LearnHeader from "../../learn/LearnHeader"
import LearnLayout from "../../learn/LearnLayout"

// Readability/scannability tuning scoped to this page. DescrContainer and
// NameContainer are shared with other pages, so we override locally rather than
// editing the shared components (same rationale as the AI Research Tools page).
const MapleAIBody = styled(Container)`
  /* Match the values (Principles) card body size (0.9375rem); DescrContainer
     defaults to 16px. */
  ${DescrContainer} {
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  /* Sub-headings under Limitations & Risks (Limitations, Risks, Data privacy)
     default to 25px, nearly matching the 26px section title. Scale them down so
     they read as clearly subordinate, and set them in the heading font. */
  ${NameContainer} {
    font-family: var(--maple-font-heading);
    font-size: 1.125rem;
    line-height: 1.35;
  }

  /* Labeled bullets: the lead-in term carries the scannable meaning, so set it
     in the heading font with the strong ink, and keep the list comfortably
     spaced. */
  ul {
    margin-bottom: 0;
    padding-left: 1.25rem;
  }

  li {
    line-height: 1.5;
  }

  li b {
    font-family: var(--maple-font-heading);
    color: var(--maple-text-strong);
  }
`

// The four principles say little each, so a 2-up grid of compact tiles is much
// shorter than the stacked MemberItem/Divider list used elsewhere on the page.
const PrinciplesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem 2rem;
  /* Match the py-4/px-4 (1.5rem) breathing room the other cards give their
     content below the title bar; the old 0.25rem top crammed it upward. */
  padding: 1.5rem;

  @media (max-width: 34rem) {
    grid-template-columns: 1fr;
  }
`

const Principle = styled.div`
  h3 {
    font-family: var(--maple-font-heading);
    font-weight: 700;
    font-size: 1rem;
    color: var(--maple-text-strong);
    margin: 0 0 0.25rem;
  }

  p {
    margin: 0;
    color: var(--maple-text-body);
    font-size: 0.9375rem;
    line-height: 1.4;
  }
`

const PRINCIPLES = ["desc1", "desc2", "desc3", "desc4"]

const MapleAI = () => {
  const { t } = useTranslation(["mapleAI", "common"])

  // Header, subhead and breadcrumb follow the Learn section's styling; the
  // section bodies below keep the existing copy.
  return (
    <LearnLayout width="medium">
      <LearnBreadcrumb section={t("breadcrumb")} eyebrow={t("common:about")} />
      <LearnHeader
        title={t("title")}
        subhead={t("mission-statement")}
        titleSize="2.25rem"
        subheadMaxWidth="none"
      />
      <MapleAIBody className="px-0">
        {/* Guiding principles */}
        <Row>
          <Col className="py-4">
            <SectionContainer>
              <SectionTitle className="p-3">{t("section2.title")}</SectionTitle>
              <PrinciplesGrid>
                {PRINCIPLES.map(k => (
                  <Principle key={k}>
                    <h3>{t(`section2.${k}Title`)}</h3>
                    <p>{t(`section2.${k}Main`)}</p>
                  </Principle>
                ))}
              </PrinciplesGrid>
            </SectionContainer>
          </Col>
        </Row>

        {/* Current use */}
        <Row>
          <Col className="py-4">
            <SectionContainer>
              <SectionTitle className="p-3">{t("section1.title")}</SectionTitle>
              <DescrContainer className="py-4 px-4">
                {t("section1.desc1")}
              </DescrContainer>
              <DescrContainer className="pb-4 px-4">
                <ul>
                  <li className="pb-3">
                    <b>{t("section1.desc2Bold")}</b> {t("section1.desc2Main")}
                  </li>
                  <li className="pb-3">
                    <b>{t("section1.desc3Bold")}</b> {t("section1.desc3Main")}
                  </li>
                  <li>
                    <b>{t("section1.desc4Bold")}</b> {t("section1.desc4Main")}
                  </li>
                </ul>
              </DescrContainer>
              <DescrContainer className="pb-4 px-4">
                <b>{t("legal-advisory")}</b>
              </DescrContainer>
            </SectionContainer>
          </Col>
        </Row>

        {/* About our AI systems */}
        <Row>
          <Col className="py-4">
            <SectionContainer>
              <SectionTitle className="p-3">{t("section4.title")}</SectionTitle>
              <DescrContainer className="py-4 px-4">
                {t("section4.sub1.desc1")}
              </DescrContainer>
              <DescrContainer className="pb-4 px-4">
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

        {/* Future deployments */}
        <Row>
          <Col className="py-4">
            <SectionContainer>
              <SectionTitle className="p-3">{t("section5.title")}</SectionTitle>
              <DescrContainer className="py-4 px-4">
                {t("section5.desc1")}
              </DescrContainer>
              <DescrContainer className="pb-4 px-4">
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

        {/* Limitations and risks */}
        <Row>
          <Col className="py-4">
            <SectionContainer>
              <SectionTitle className="p-3">{t("section3.title")}</SectionTitle>
              <MemberItem
                name={t("section3.desc1Title")}
                descr={t("section3.desc1Main")}
              />
              <DescrContainer className="pb-4 px-4">
                <b>{t("legal-advisory")}</b>
              </DescrContainer>
              <Divider />
              <MemberItem
                name={t("section3.desc2Title")}
                descr={t("section3.desc2Main")}
              />
              <Divider />
              <NameContainer className="py-4 px-4">
                {t("section3.desc3Title")}
              </NameContainer>
              <DescrContainer className="pb-4 px-4">
                {t("section3.desc3Pre")} <i>{t("section3.desc3Italic")}</i>{" "}
                {t("section3.desc3Main")}
              </DescrContainer>
            </SectionContainer>
          </Col>
        </Row>

        {/* Cross-link to the AI Research Tools page */}
        <Row>
          <Col className="py-4">
            <SectionContainer>
              <SectionTitle className="p-3">
                {t("aiResearch.title")}
              </SectionTitle>
              <DescrContainer className="py-4 px-4">
                {t("aiResearch.desc")}
              </DescrContainer>
              <DescrContainer className="pb-4 px-4">
                <Internal href="/learn/ai-tools">
                  {t("aiResearch.linkText")}
                </Internal>
              </DescrContainer>
            </SectionContainer>
          </Col>
        </Row>
      </MapleAIBody>
    </LearnLayout>
  )
}

export default MapleAI
