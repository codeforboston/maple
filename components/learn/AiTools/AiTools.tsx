import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Container, Row, Col } from "../../bootstrap"
import {
  DescrContainer,
  Divider,
  SectionContainer,
  SectionTitle
} from "../../shared/CommonComponents"
import { Internal } from "../../links"
import LearnBreadcrumb from "../LearnBreadcrumb"
import LearnHeader from "../LearnHeader"
import LearnLayout from "../LearnLayout"

const ExampleBox = styled.div`
  background: var(--maple-surface-raised);
  border-left: 4px solid var(--maple-brand-primary);
  border-radius: 0 var(--maple-radius-md) var(--maple-radius-md) 0;
  padding: 1rem 1.25rem;
  margin: 0.75rem 0;
  font-size: 15px;
  font-style: italic;
  color: var(--maple-text-body);
`

const StepNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--maple-brand-primary);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
  margin-right: 0.75rem;
`

const StepRow = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0.75rem 1.25rem;
`

const StepText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: var(--maple-text-body);
  line-height: 1.5;
`

const ExampleLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--maple-brand-primary);
  margin-bottom: 0.25rem;
`

export const AiTools = () => {
  const { t } = useTranslation("aiTools")
  const { t: tLearn } = useTranslation("learn")

  // Header, subhead and breadcrumb follow the Learn section's styling. The body
  // below is unchanged: it hosts the MCP setup instructions that
  // mcp-server/auth.ts and functions/src/mcp/proxy.ts point users to.
  return (
    <LearnLayout width="wide">
      <LearnBreadcrumb section={tLearn("aiTools.breadcrumb")} />
      <LearnHeader
        title={t("title")}
        subhead={t("description")}
        titleSize="2.25rem"
      />
      <Container className="px-0">
        {/* What is it */}
        <Row>
          <Col className="py-3">
            <SectionContainer>
              <SectionTitle className="p-2">{t("section1.title")}</SectionTitle>
              <DescrContainer className="py-3 px-4">
                {t("section1.desc1")}
              </DescrContainer>
              <DescrContainer className="pb-3 px-4">
                {t("section1.desc2Pre")}{" "}
                <b>
                  <a
                    href="https://modelcontextprotocol.io/introduction"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("section1.desc2LinkText")}
                  </a>
                </b>
                {t("section1.desc2Post")}
              </DescrContainer>
            </SectionContainer>
          </Col>
        </Row>

        {/* What you can do */}
        <Row>
          <Col className="py-3">
            <SectionContainer>
              <SectionTitle className="p-2">{t("section2.title")}</SectionTitle>
              <DescrContainer className="py-3 px-4">
                {t("section2.intro")}
              </DescrContainer>
              <DescrContainer className="pb-1 px-4">
                <ul>
                  <li className="pb-3">
                    <b>{t("section2.item1Bold")}</b> {t("section2.item1Main")}
                  </li>
                  <li className="pb-3">
                    <b>{t("section2.item2Bold")}</b> {t("section2.item2Main")}
                  </li>
                  <li className="pb-3">
                    <b>{t("section2.item3Bold")}</b> {t("section2.item3Main")}
                  </li>
                  <li className="pb-3">
                    <b>{t("section2.item4Bold")}</b> {t("section2.item4Main")}
                  </li>
                  <li className="pb-3">
                    <b>{t("section2.item5Bold")}</b> {t("section2.item5Main")}
                  </li>
                  <li className="pb-3">
                    <b>{t("section2.item6Bold")}</b> {t("section2.item6Main")}
                  </li>
                  <li>
                    <b>{t("section2.item7Bold")}</b> {t("section2.item7Main")}
                  </li>
                </ul>
              </DescrContainer>
            </SectionContainer>
          </Col>
        </Row>

        {/* Examples */}
        <Row>
          <Col className="py-3">
            <SectionContainer>
              <SectionTitle className="p-2">{t("section3.title")}</SectionTitle>
              <DescrContainer className="py-3 px-4">
                {t("section3.intro")}
              </DescrContainer>
              <div className="px-4 pb-4">
                <ExampleLabel>{t("section3.example1Label")}</ExampleLabel>
                <ExampleBox>
                  &ldquo;{t("section3.example1Text")}&rdquo;
                </ExampleBox>

                <ExampleLabel>{t("section3.example2Label")}</ExampleLabel>
                <ExampleBox>
                  &ldquo;{t("section3.example2Text")}&rdquo;
                </ExampleBox>

                <ExampleLabel>{t("section3.example3Label")}</ExampleLabel>
                <ExampleBox>
                  &ldquo;{t("section3.example3Text")}&rdquo;
                </ExampleBox>

                <ExampleLabel>{t("section3.example4Label")}</ExampleLabel>
                <ExampleBox>
                  &ldquo;{t("section3.example4Text")}&rdquo;
                </ExampleBox>
              </div>
            </SectionContainer>
          </Col>
        </Row>

        {/* How to get started */}
        <Row>
          <Col className="py-3">
            <SectionContainer>
              <SectionTitle className="p-2">{t("section4.title")}</SectionTitle>
              <DescrContainer className="py-3 px-4">
                {t("section4.intro")}
              </DescrContainer>
              <StepRow>
                <StepNumber>1</StepNumber>
                <StepText>
                  <b>{t("section4.step1Bold")}</b> {t("section4.step1Pre")}{" "}
                  <Internal href="/login">
                    {t("section4.step1LinkText")}
                  </Internal>
                  {t("section4.step1Post")}
                </StepText>
              </StepRow>
              <Divider />
              <StepRow>
                <StepNumber>2</StepNumber>
                <StepText>
                  <b>{t("section4.step2Bold")}</b> {t("section4.step2Intro")}
                  <ul style={{ marginTop: "0.5rem" }}>
                    <li className="pb-2">
                      <b>{t("section4.step2item1Bold")}</b>{" "}
                      {t("section4.step2item1Tag")}{" "}
                      {t("section4.step2item1Pre")}{" "}
                      <a
                        href="https://claude.ai/download"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("section4.step2item1Link1")}
                      </a>
                      {t("section4.step2item1Mid")}{" "}
                      <a
                        href="https://modelcontextprotocol.io/quickstart/user"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("section4.step2item1Link2")}
                      </a>
                      {t("section4.step2item1Post")}
                    </li>
                    <li className="pb-2">
                      <b>{t("section4.step2item2Bold")}</b>{" "}
                      {t("section4.step2item2Tag")}{" "}
                      {t("section4.step2item2Pre")}{" "}
                      <a
                        href="https://help.openai.com/en/articles/11487775-connectors-in-chatgpt"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("section4.step2item2LinkText")}
                      </a>{" "}
                      {t("section4.step2item2Post")}
                    </li>
                    <li>
                      <b>{t("section4.step2item3Bold")}</b>{" "}
                      {t("section4.step2item3Main")}
                    </li>
                  </ul>
                </StepText>
              </StepRow>
              <Divider />
              <StepRow>
                <StepNumber>3</StepNumber>
                <StepText>
                  <b>{t("section4.step3Bold")}</b> {t("section4.step3Pre")}{" "}
                  <Internal href="/dev/token">
                    {t("section4.step3LinkText")}
                  </Internal>{" "}
                  {t("section4.step3Post")}
                </StepText>
              </StepRow>
              <Divider />
              <StepRow>
                <StepNumber>4</StepNumber>
                <StepText>
                  <b>{t("section4.step4Bold")}</b> {t("section4.step4Pre")}{" "}
                  <code>YOUR_TOKEN_HERE</code> {t("section4.step4Post")}
                </StepText>
              </StepRow>
              <div className="px-4 pb-4">
                <pre
                  style={{
                    background: "var(--maple-surface-raised)",
                    borderRadius: "var(--maple-radius-md)",
                    padding: "1rem",
                    fontSize: "13px",
                    overflowX: "auto"
                  }}
                >{`{
  "mcpServers": {
    "maple": {
      "type": "http",
      "url": "https://mapletestimony.org/api/mcp",
      "headers": {
        "X-Maple-Token": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}`}</pre>
              </div>
              <Divider />
              <StepRow>
                <StepNumber>5</StepNumber>
                <StepText>
                  <b>{t("section4.step5Bold")}</b> {t("section4.step5Post")}
                </StepText>
              </StepRow>
              <DescrContainer className="py-3 px-4">
                <b>{t("section4.needHelp")}</b> {t("section4.needHelpPost")}{" "}
                <a href="mailto:info@mapletestimony.org">
                  info@mapletestimony.org
                </a>
                .
              </DescrContainer>
            </SectionContainer>
          </Col>
        </Row>

        {/* Privacy */}
        <Row>
          <Col className="py-3">
            <SectionContainer>
              <SectionTitle className="p-2">{t("section5.title")}</SectionTitle>
              <DescrContainer className="py-3 px-4">
                {t("section5.desc1")}
              </DescrContainer>
              <DescrContainer className="pb-3 px-4">
                {t("section5.desc2Pre")}{" "}
                <Internal href="/about/how-maple-uses-ai">
                  {t("section5.desc2LinkText")}
                </Internal>
              </DescrContainer>
            </SectionContainer>
          </Col>
        </Row>
      </Container>
    </LearnLayout>
  )
}

export default AiTools
