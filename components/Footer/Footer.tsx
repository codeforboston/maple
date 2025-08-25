/* use client */

import { authStepChanged } from "components/auth/redux"
import { useAppDispatch } from "components/hooks"
import { User } from "firebase/auth"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { NavLink } from "../Navlink"
import { Button, Col, Image, Container, Row, Nav, Navbar } from "../bootstrap"
import CustomDropdown, {
  CustomDropdownProps
} from "components/Footer/CustomFooterDropdown"
import { FooterContainer } from "./FooterContainer"
import { NEWSLETTER_SIGNUP_URL } from "components/common"

export type PageFooterProps = {
  children?: any
  authenticated: boolean
  user: User | null | undefined
  signOut: () => void
}

const TextHeader = styled.h6`
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  padding: 0.5rem 1rem 0 0;
  margin: 0;
`

const BrowseHeader = styled(NavLink)`
  font-size: 1rem;
  color: #fff;
  padding: 0.5rem 1rem 0 0;
  margin: 0 0 10px 0;

  @media (max-width: 768px) {
    padding-bottom: 0.6rem;
    border-bottom: solid 1.5px rgba(255, 255, 255, 0.75);
    margin: 0;
  }

  &:hover {
    color: white;
    text-decoration: underline 1.5px;
  }
`

const StyledInternalLink = styled(NavLink)`
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: -0.63px;
  padding-top: 4;
  margin: 5px 0;

  &:hover {
    color: white;
    text-decoration: none;
  }
`

function MapleContainer({ className }: { className?: string }) {
  const { t } = useTranslation("footer")
  return (
    <div style={{ maxWidth: "220px" }} className={className}>
      <Row style={{ textAlign: "center" }}>
        <p style={{ fontSize: "1em", color: "#fff" }}>{t("headers.follow")}</p>
      </Row>
      <Row style={{ justifyContent: "center" }}>
        <Col style={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="light"
            style={{ borderRadius: 50, padding: 8, margin: 5 }}
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
            style={{ borderRadius: 50, padding: 8, margin: 5 }}
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
            style={{ borderRadius: 50, padding: 8, margin: 5 }}
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

const TermsAndPolicies = () => {
  const { t } = useTranslation("footer")
  return (
    <>
      <StyledInternalLink href="/policies">
        {t("legal.privacyPolicy")}
      </StyledInternalLink>
      <StyledInternalLink href="/policies/copyright">
        {t("legal.TOS")}
      </StyledInternalLink>
      <StyledInternalLink href="/policies/code-of-conduct">
        {t("legal.codeOfConduct")}
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
      <StyledInternalLink href="/learn/writing-effective-testimony">
        {t("links.learnWriting")}
      </StyledInternalLink>
      <StyledInternalLink href="/learn/legislative-process">
        {t("links.learnProcess")}
      </StyledInternalLink>
      <StyledInternalLink href="/why-use-maple/for-individuals">
        {t("links.learnWhy")}
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
      <StyledInternalLink href="/about/how-maple-uses-ai">
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
      <BrowseHeader href="/bills">{t("navigation.browseBills")}</BrowseHeader>
    </>
  )
}

const PageFooter = (props: PageFooterProps) => {
  const { t } = useTranslation(["footer", "common"])
  return (
    <FooterContainer
      fluid
      className="bg-black d-flex flex-wrap flex-column-reverse flex-md-row align-items-center align-items-md-stretch p-2 p-md-5"
    >
      <Navbar
        variant="dark"
        expand="lg"
        className="d-md-none w-100 order-1 p-2 mb-2"
      >
        <Nav className={`d-flex w-100`}>
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
        </Nav>
      </Navbar>
      <div className={`d-none d-md-flex order-1 flex-grow-1`}>
        <Col>
          <BrowseList />
          <TextHeader>{t("headers.account")}</TextHeader>

          <AccountLinks {...props} />
        </Col>
        <Col>
          <TextHeader>{t("about", { ns: "common" })}</TextHeader>
          <AboutLinks />
          <TextHeader>{t("learn", { ns: "common" })}</TextHeader>
          <LearnLinks />
        </Col>
        <Col>
          <TextHeader>{t("headers.resources")}</TextHeader>
          <TermsAndPolicies />
        </Col>
      </div>
      <MapleContainer className={`col-auto order-md-2 justify-self-end `} />
      <div
        className={`d-flex flex-column gap-2 flex-md-row flex-wrap col-12 flex-shrink-0 order-md-3 text-center text-md-start`}
      >
        <Col className="text-white col-md-auto">
          {t("legal.disclaimer")}
          {" - "}
          <a
            href={NEWSLETTER_SIGNUP_URL}
            style={{ color: "white" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("newsletter")}
          </a>
        </Col>
      </div>
    </FooterContainer>
  )
}

export default PageFooter
