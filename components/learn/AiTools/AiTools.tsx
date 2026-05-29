import styled from "styled-components"
import { Container, Row, Col } from "../../bootstrap"
import {
  DescrContainer,
  Divider,
  PageDescr,
  PageTitle,
  SectionContainer,
  SectionTitle
} from "../../shared/CommonComponents"
import { Internal } from "../../links"

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
  return (
    <Container>
      <Row>
        <Col>
          <PageTitle>AI Research Tools</PageTitle>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <PageDescr>
            Search MAPLE&apos;s full database of bills, testimony, and ballot
            questions by having a conversation with an AI assistant.
          </PageDescr>
        </Col>
      </Row>

      {/* What is it */}
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">What is this feature?</SectionTitle>
            <DescrContainer className="py-3 px-4">
              MAPLE now lets you connect AI chat tools—like Claude or
              ChatGPT—directly to its database. This means you can ask your AI
              assistant questions about Massachusetts legislation in plain
              language, and it will search MAPLE&apos;s data on bills, ballot
              questions, and testimony to answer questions or help with research.
            </DescrContainer>
            <DescrContainer className="pb-3 px-4">
              This works through a standard called{" "}
              <b>
                <a
                  href="https://modelcontextprotocol.io/introduction"
                  target="_blank"
                  rel="noreferrer"
                >
                  MCP (Model Context Protocol)
                </a>
              </b>
              , which allows AI tools to securely retrieve live data from
              services like MAPLE. Think of it as giving your AI assistant a
              direct line to MAPLE&apos;s research library.
            </DescrContainer>
          </SectionContainer>
        </Col>
      </Row>

      {/* What you can do */}
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">What can you ask?</SectionTitle>
            <DescrContainer className="py-3 px-4">
              Once connected, you can ask your AI assistant to:
            </DescrContainer>
            <DescrContainer className="pb-1 px-4">
              <ul>
                <li className="pb-3">
                  <b>Find bills by topic</b> — search the full text and
                  summaries of all bills across legislative sessions
                </li>
                <li className="pb-3">
                  <b>Map a policy area</b> — get a comprehensive view of all
                  bills under a topic, how they relate, and which have the most
                  public support
                </li>
                <li className="pb-3">
                  <b>Track policy evolution</b> — compare how proposals on a
                  topic have changed across General Court sessions, and identify
                  which ideas have gained or lost traction over time
                </li>
                <li className="pb-3">
                  <b>Synthesize public testimony</b> — surface the main
                  arguments, common themes, and organizational voices in
                  testimony on a bill or policy area
                </li>
                <li className="pb-3">
                  <b>Read public testimony</b> — see what advocates,
                  organizations, and constituents have said about specific bills
                </li>
                <li className="pb-3">
                  <b>Filter and compare</b> — narrow results by committee,
                  primary sponsor, legislation type, or session
                </li>
                <li>
                  <b>Search ballot questions</b> — find and understand statewide
                  ballot measures alongside legislative bills
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
            <SectionTitle className="p-2">Example questions to try</SectionTitle>
            <DescrContainer className="py-3 px-4">
              Here are some examples of how advocates have used this feature:
            </DescrContainer>
            <div className="px-4 pb-4">
              <ExampleLabel>Research by topic</ExampleLabel>
              <ExampleBox>
                &ldquo;Find bills about housing affordability that are currently
                in committee. Summarize what each one proposes.&rdquo;
              </ExampleBox>

              <ExampleLabel>Understand a specific bill</ExampleLabel>
              <ExampleBox>
                &ldquo;What does H.1234 propose, and what has public testimony
                said about it? Are there more people who support or oppose
                it?&rdquo;
              </ExampleBox>

              <ExampleLabel>Explore a policy area</ExampleLabel>
              <ExampleBox>
                &ldquo;What bills related to clean water or sewage have been
                filed in Massachusetts in the last two sessions? Which ones got
                the most public engagement?&rdquo;
              </ExampleBox>

              <ExampleLabel>Prepare to testify</ExampleLabel>
              <ExampleBox>
                &ldquo;I want to testify in favor of expanding paid family
                leave. What are the relevant bills this session, and what
                arguments have other supporters already made?&rdquo;
              </ExampleBox>
            </div>
          </SectionContainer>
        </Col>
      </Row>

      {/* How to get started */}
      <Row>
        <Col className="py-3">
          <SectionContainer>
            <SectionTitle className="p-2">How to get started</SectionTitle>
            <DescrContainer className="py-3 px-4">
              Follow these steps to connect an AI assistant to MAPLE:
            </DescrContainer>
            <StepRow>
              <StepNumber>1</StepNumber>
              <StepText>
                <b>Create a free MAPLE account</b> at{" "}
                <Internal href="/login">mapletestimony.org</Internal>. A MAPLE
                account is required to authenticate your AI assistant&apos;s
                access to the database.
              </StepText>
            </StepRow>
            <Divider />
            <StepRow>
              <StepNumber>2</StepNumber>
              <StepText>
                <b>Choose an AI tool that supports MCP.</b> Several options
                work with MAPLE:
                <ul style={{ marginTop: "0.5rem" }}>
                  <li className="pb-2">
                    <b>Claude Desktop</b> (Anthropic) — the easiest option for
                    most users.{" "}
                    <a
                      href="https://claude.ai/download"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download for Mac, Windows, or mobile
                    </a>
                    , then follow the{" "}
                    <a
                      href="https://modelcontextprotocol.io/quickstart/user"
                      target="_blank"
                      rel="noreferrer"
                    >
                      MCP setup guide
                    </a>
                    .
                  </li>
                  <li className="pb-2">
                    <b>ChatGPT</b> (OpenAI) — available for Pro, Team, and
                    Enterprise subscribers via{" "}
                    <a
                      href="https://modelcontextprotocol.io/docs/develop/connect-remote-servers"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Apps &amp; Connectors
                    </a>{" "}
                    with Developer Mode enabled in settings.
                  </li>
                  <li>
                    <b>Other tools</b> — MCP is an open standard and support is
                    growing rapidly across AI products. Check your AI
                    tool&apos;s documentation for current MCP connection
                    instructions.
                  </li>
                </ul>
              </StepText>
            </StepRow>
            <Divider />
            <StepRow>
              <StepNumber>3</StepNumber>
              <StepText>
                <b>Get your MAPLE API token.</b> After logging in to your MAPLE
                account, visit{" "}
                <Internal href="/dev/token">your token page</Internal> to
                generate a personal access token. This lets your AI assistant
                authenticate as you when accessing MAPLE data.
              </StepText>
            </StepRow>
            <Divider />
            <StepRow>
              <StepNumber>4</StepNumber>
              <StepText>
                <b>Add MAPLE as a connected source in your AI tool.</b> Most
                tools use a configuration file or settings panel. Add the
                following connection details, replacing{" "}
                <code>YOUR_TOKEN_HERE</code> with the token from step 3:
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
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}`}</pre>
            </div>
            <Divider />
            <StepRow>
              <StepNumber>5</StepNumber>
              <StepText>
                <b>Start a new conversation</b> and try one of the example
                questions above. Your AI assistant will automatically search
                MAPLE when you ask about Massachusetts legislation.
              </StepText>
            </StepRow>
            <DescrContainer className="py-3 px-4">
              <b>Need help?</b> Email us at{" "}
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
            <SectionTitle className="p-2">Privacy & data use</SectionTitle>
            <DescrContainer className="py-3 px-4">
              When you use this feature, your AI assistant retrieves only
              publicly available MAPLE data—the same bills and testimony anyone
              can read on this site. Your MAPLE token identifies you so that
              your access is logged, but no private account information is
              shared with the AI.
            </DescrContainer>
            <DescrContainer className="pb-3 px-4">
              Your conversations are governed by your AI provider&apos;s privacy
              policy, not MAPLE&apos;s. We recommend reviewing it before
              discussing sensitive advocacy work.{" "}
              <Internal href="/about/how-maple-uses-ai">
                Learn more about how MAPLE uses AI →
              </Internal>
            </DescrContainer>
          </SectionContainer>
        </Col>
      </Row>
    </Container>
  )
}

export default AiTools
