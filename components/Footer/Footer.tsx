/* use client */

import { authStepChanged } from "components/auth/redux"
import { useAppDispatch } from "components/hooks"
import { User } from "firebase/auth"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { ExternalNavLink, NavLink } from "../Navlink"
import { Button, Col, Image, Container, Row, Nav, Navbar } from "../bootstrap"
import CustomDropdown, {
  CustomDropdownProps
} from "components/Footer/CustomFooterDropdown"
import { FooterContainer } from "./FooterContainer"
import { NEWSLETTER_SIGNUP_URL } from "components/common"
import { flags } from "../featureFlags"
import { MapleOnly, DigitalDemocracyOnly } from "components/shared/SkinOnly"

export type PageFooterProps = {
  children?: any
  authenticated: boolean
  user: User | null | undefined
  signOut: () => void
}

const TextHeader = styled.h6`
  font-size: 1rem;
  font-weight: bold;
  color: var(--maple-text-inverse);
  padding: 0.5rem 1rem 0 0;
  margin: 0;
`

/* Digital Democracy and Mixed: a section heading that follows another
   section in the same column (About after Browse, Policies after Learn,
   Other Resources after Account), set apart from what is above it. */
const NextSectionHeader = styled(TextHeader)`
  margin-top: 1.5rem;
`

const BrowseHeader = styled(NavLink)`
  font-size: 1rem;
  color: var(--maple-text-inverse);
  padding: 0.5rem 1rem 0 0;
  margin: 0 0 var(--maple-space-sm) 0;

  @media (max-width: 768px) {
    padding-bottom: var(--maple-space-sm);
    border-bottom: solid 1.5px var(--maple-border-inverse-soft);
    margin: 0;
  }

  &:hover {
    color: var(--maple-text-inverse);
    text-decoration: underline 1.5px;
  }
`

const StyledInternalLink = styled(NavLink)`
  color: var(--maple-text-inverse-muted);
  letter-spacing: -0.63px;
  padding-top: var(--maple-space-xs);
  margin: var(--maple-space-xs) 0;

  &:hover {
    color: var(--maple-text-inverse);
    text-decoration: none;
  }
`

function MapleContainer({ className }: { className?: string }) {
  const { t } = useTranslation("footer")
  return (
    <div style={{ maxWidth: "220px" }} className={className}>
      <Row style={{ textAlign: "center" }}>
        <p style={{ fontSize: "1em", color: "var(--maple-text-inverse)" }}>
          {t("headers.follow")}
        </p>
      </Row>
      <Row style={{ justifyContent: "center" }}>
        <Col style={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="light"
            style={{
              borderRadius: "var(--maple-radius-pill)",
              padding: "var(--maple-space-md)",
              margin: "var(--maple-space-sm)"
            }}
            href="https://twitter.com/MapleTestimony"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/images/twitter.svg"
              alt={t("links.socials.twitter")}
              width="24"
              height="24"
            ></Image>
          </Button>
          <Button
            variant="light"
            href="https://www.instagram.com/mapletestimony/?hl=en"
            style={{
              borderRadius: "var(--maple-radius-pill)",
              padding: "var(--maple-space-md)",
              margin: "var(--maple-space-sm)"
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/images/instagram.svg"
              alt={t("links.socials.instagram")}
              width="24"
              height="24"
            ></Image>
          </Button>
          <Button
            variant="light"
            style={{
              borderRadius: "var(--maple-radius-pill)",
              padding: "var(--maple-space-md)",
              margin: "var(--maple-space-sm)"
            }}
            href="https://www.linkedin.com/company/maple-testimony"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/Linked In.svg"
              alt={t("links.socials.linkedin")}
              width="24"
              height="24"
            ></Image>
          </Button>
        </Col>
      </Row>
      <Row style={{ marginTop: 10 }}>
        <Image
          className="bg-transparent"
          src="/maple-footer-white.png"
          alt={t("logo")}
          width={100}
        />
      </Row>
    </div>
  )
}

/* Footer links that leave MAPLE, styled as the others. */
const StyledExternalLink = styled(ExternalNavLink)`
  color: var(--maple-text-inverse-muted);
  letter-spacing: -0.63px;
  padding-top: var(--maple-space-xs);
  margin: var(--maple-space-xs) 0;

  &:hover {
    color: var(--maple-text-inverse);
    text-decoration: none;
  }
`

/* Digital Democracy and Mixed: Other Resources, the writing guide (out of
   the Learn menu there) and two links outside MAPLE. */
const OtherResources = () => {
  const { t } = useTranslation("footer")
  return (
    <>
      <StyledInternalLink href="/writing-effective-testimony">
        {t("links.writingTestimony")}
      </StyledInternalLink>
      <StyledExternalLink href={NEWSLETTER_SIGNUP_URL}>
        {t("links.subscribeNewsletter")}
      </StyledExternalLink>
      <StyledExternalLink href="https://malegislature.gov/Search/FindMyLegislator">
        {t("links.findLegislator")}
      </StyledExternalLink>
    </>
  )
}

const TermsAndPolicies = () => {
  const { t } = useTranslation("footer")
  return (
    <>
      <StyledInternalLink href="/policies/privacy">
        {t("legal.privacyPolicy")}
      </StyledInternalLink>
      <StyledInternalLink href="/policies/copyright">
        {t("legal.TOS")}
      </StyledInternalLink>
      <StyledInternalLink href="/policies/code-of-conduct">
        {t("legal.codeOfConduct")}
      </StyledInternalLink>
      {/* Digital Democracy and Mixed: How MAPLE Uses AI sits under Policies. */}
      <StyledInternalLink
        href="/about/how-maple-uses-ai"
        className="nav-dd-only"
      >
        {t("links.mapleAI")}
      </StyledInternalLink>
    </>
  )
}

const AccountLinks = ({ authenticated, user, signOut }: PageFooterProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation(["common", "auth"])
  return (
    <>
      {authenticated ? (
        <>
          <StyledInternalLink
            href={`${user?.uid ? "/profile?id=" + user?.uid : "/profile"}`}
          >
            {t("navigation.accountProfile")}
          </StyledInternalLink>
          <StyledInternalLink href={"/newsfeed"}>
            {t("navigation.newsfeed")}
          </StyledInternalLink>
          <StyledInternalLink handleClick={() => signOut()}>
            {t("signOut", { ns: "auth" })}
          </StyledInternalLink>
        </>
      ) : (
        <StyledInternalLink
          handleClick={() => dispatch(authStepChanged("start"))}
        >
          {t("signIn", { ns: "auth" })}
        </StyledInternalLink>
      )}
    </>
  )
}

const LearnLinks = () => {
  const { t } = useTranslation(["footer", "common"])
  return (
    <>
      {/* Maple keeps main's "About Testimony"; Digital Democracy and Mixed use
          the page's own title, as the navbar's Learn menu does. */}
      <StyledInternalLink href="/learn/testimony" className="nav-maple-only">
        {t("links.learnWriting")}
      </StyledInternalLink>
      <StyledInternalLink href="/learn/testimony" className="nav-dd-only">
        {t("navigation.aboutTestimony", { ns: "common" })}
      </StyledInternalLink>
      <StyledInternalLink href="/learn/legislative-process">
        {t("links.learnProcess")}
      </StyledInternalLink>
      <StyledInternalLink href="/why-use-maple/for-individuals">
        {t("links.learnWhy")}
      </StyledInternalLink>
      <StyledInternalLink href="/learn/ai-tools">
        {t("links.learnAi")}
      </StyledInternalLink>
    </>
  )
}

const AboutLinks = () => {
  const { t } = useTranslation(["footer", "common"])
  return (
    <>
      <StyledInternalLink href="/about/mission-and-goals">
        {t("links.ourMission")}
      </StyledInternalLink>
      <StyledInternalLink href="/about/our-team">
        {t("links.team")}
      </StyledInternalLink>
      <StyledInternalLink href="/about/support-maple">
        {t("links.supportMaple")}
      </StyledInternalLink>
      <StyledInternalLink href="/about/faq-page">
        {t("links.faq")}
      </StyledInternalLink>
      {/* Maple only: Digital Democracy and Mixed list it under Policies. */}
      <StyledInternalLink
        href="/about/how-maple-uses-ai"
        className="nav-maple-only"
      >
        {t("links.mapleAI")}
      </StyledInternalLink>
    </>
  )
}

const BrowseList = () => {
  const { t } = useTranslation("common")
  return (
    <>
      <BrowseHeader href="/testimony">
        {t("navigation.browseTestimony")}
      </BrowseHeader>
      {flags().hearingsAndTranscriptions ? (
        <BrowseHeader href="/hearings">
          {t("navigation.browseHearings")}
        </BrowseHeader>
      ) : null}
      <BrowseHeader href="/bills">{t("navigation.browseBills")}</BrowseHeader>
      {flags().ballotQuestions ? (
        <BrowseHeader href="/ballotQuestions">
          {t("navigation.browseBallotQuestions")}
        </BrowseHeader>
      ) : null}
    </>
  )
}

/* Digital Democracy and Mixed: a Browse heading like the other groups, with
   the explorers listed under it as plain links. */
const BrowseLinks = () => {
  const { t } = useTranslation("common")
  return (
    <>
      <StyledInternalLink href="/bills">
        {t("navigation.bills")}
      </StyledInternalLink>
      {flags().hearingsAndTranscriptions ? (
        <StyledInternalLink href="/hearings">
          {t("navigation.hearings")}
        </StyledInternalLink>
      ) : null}
      <StyledInternalLink href="/testimony">
        {t("navigation.testimony")}
      </StyledInternalLink>
      {flags().ballotQuestions ? (
        <StyledInternalLink href="/ballotQuestions">
          {t("navigation.ballotQuestions")}
        </StyledInternalLink>
      ) : null}
    </>
  )
}

/* The Maple skin keeps the footer from main; Digital Democracy and Mixed get
   the Browse group. Both are rendered and the skin picks one. */

/* Digital Democracy and Mixed, desktop: the disclaimer and newsletter link
   sit in the last column, under Policies, so the bottom line is not shown
   there. Phones have
   no columns and keep it. */
const ColumnNote = styled.p`
  /* At the foot of the column, level with the bottom of the others. */
  margin: auto 0 0;
  padding-top: var(--maple-space-lg);
  color: var(--maple-text-inverse-muted);
  /* The footer links' spacing (StyledInternalLink), in italics so it reads
     as a note rather than a link. */
  letter-spacing: -0.63px;
  line-height: 1.5;
  font-style: italic;
  font-weight: 300;
  /* Lexend, at the links' size. */
  font-family: var(--maple-font-heading);
`

/* The disclaimer as a note on phones, styled as in the desktop's column
   (ColumnNote). */
const BottomNote = styled.p`
  margin: 0;
  color: var(--maple-text-inverse-muted);
  font-family: var(--maple-font-heading);
  font-style: italic;
  font-weight: 300;
  letter-spacing: -0.63px;
  line-height: 1.5;
`

/* Digital Democracy and Mixed only, its contents stacked as a column. */
const DigitalDemocracyStack = styled(DigitalDemocracyOnly)`
  [data-maple-theme="dd"] & {
    display: flex;
    flex-direction: column;
  }
`

/* The last column (Digital Democracy and Mixed) runs the full height of the
   footer's columns, so its note can sit at the foot. */
const NoteColumn = styled(DigitalDemocracyStack)`
  [data-maple-theme="dd"] & {
    flex: 1 1 auto;
  }
`

const PageFooter = (props: PageFooterProps) => {
  const { t } = useTranslation(["footer", "common"])
  return (
    <FooterContainer
      fluid
      className="d-flex flex-wrap flex-column-reverse flex-md-row align-items-center align-items-md-stretch p-2 p-md-5"
      style={{ backgroundColor: "#000" }}
    >
      <Navbar
        variant="dark"
        expand="lg"
        className="d-md-none w-100 order-1 p-2 mb-2"
      >
        <Nav className={`d-flex w-100`}>
          <MapleOnly className="w-100">
            <BrowseList />

            <CustomDropdown title={t("headers.account")}>
              <AccountLinks {...props} />
            </CustomDropdown>

            <CustomDropdown title={t("learn", { ns: "common" })}>
              <LearnLinks />
            </CustomDropdown>

            <CustomDropdown title={t("about", { ns: "common" })}>
              <AboutLinks />
            </CustomDropdown>

            <CustomDropdown title={t("headers.resources")}>
              <TermsAndPolicies />
            </CustomDropdown>
          </MapleOnly>
          {/* Digital Democracy and Mixed: the desktop footer's groups, in its
              reading order, each a menu. */}
          <DigitalDemocracyOnly className="w-100">
            <CustomDropdown title={t("headers.browse")}>
              <BrowseLinks />
            </CustomDropdown>
            <CustomDropdown title={t("about", { ns: "common" })}>
              <AboutLinks />
            </CustomDropdown>
            <CustomDropdown title={t("learn", { ns: "common" })}>
              <LearnLinks />
            </CustomDropdown>
            <CustomDropdown title={t("headers.policies")}>
              <TermsAndPolicies />
            </CustomDropdown>
            <CustomDropdown title={t("headers.account")}>
              <AccountLinks {...props} />
            </CustomDropdown>
            <CustomDropdown title={t("headers.otherResources")}>
              <OtherResources />
            </CustomDropdown>
          </DigitalDemocracyOnly>
        </Nav>
      </Navbar>
      <div className={`d-none d-md-flex order-1 flex-grow-1`}>
        {/* Maple keeps main's columns; Digital Democracy and Mixed have
            Browse and About, Learn and Policies, then Account and Other
            Resources, with the disclaimer (Maple's bottom line, whose
            newsletter link is under Other Resources) at the foot. */}
        <Col>
          <MapleOnly>
            <BrowseList />
            <TextHeader>{t("headers.account")}</TextHeader>
            <AccountLinks {...props} />
          </MapleOnly>
          <DigitalDemocracyStack>
            <TextHeader>{t("headers.browse")}</TextHeader>
            <BrowseLinks />
            <NextSectionHeader>
              {t("about", { ns: "common" })}
            </NextSectionHeader>
            <AboutLinks />
          </DigitalDemocracyStack>
        </Col>
        <Col>
          <MapleOnly>
            <TextHeader>{t("about", { ns: "common" })}</TextHeader>
            <AboutLinks />
            <TextHeader>{t("learn", { ns: "common" })}</TextHeader>
            <LearnLinks />
          </MapleOnly>
          <DigitalDemocracyStack>
            <TextHeader>{t("learn", { ns: "common" })}</TextHeader>
            <LearnLinks />
            <NextSectionHeader>{t("headers.policies")}</NextSectionHeader>
            <TermsAndPolicies />
          </DigitalDemocracyStack>
        </Col>
        <Col className="d-flex flex-column">
          <MapleOnly>
            <TextHeader>{t("headers.resources")}</TextHeader>
            <TermsAndPolicies />
          </MapleOnly>
          <NoteColumn>
            <TextHeader>{t("headers.account")}</TextHeader>
            <AccountLinks {...props} />
            <NextSectionHeader>{t("headers.otherResources")}</NextSectionHeader>
            <OtherResources />
            <ColumnNote>{t("legal.disclaimer")}</ColumnNote>
          </NoteColumn>
        </Col>
      </div>
      <MapleContainer className={`col-auto order-md-2 justify-self-end `} />
      <div
        className={`footer-bottom-line col-12 order-md-3 text-center text-md-start`}
        style={{ color: "var(--maple-text-inverse)" }}
      >
        <MapleOnly>
          {t("legal.disclaimer")}
          {" - "}
          <a
            href={NEWSLETTER_SIGNUP_URL}
            style={{ color: "var(--maple-text-inverse)" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("newsletter")}
          </a>
        </MapleOnly>
        {/* Digital Democracy and Mixed, on phones (the desktop shows it in
            the last column): the disclaimer alone, as a note; the newsletter
            link is under Other Resources. */}
        <DigitalDemocracyOnly>
          <BottomNote>{t("legal.disclaimer")}</BottomNote>
        </DigitalDemocracyOnly>
      </div>
    </FooterContainer>
  )
}

export default PageFooter
