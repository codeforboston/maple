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
  font-family: Nunito;
  padding: 0.5rem 1rem 0 0;
  margin: 0;
`

const StyledInternalLink = styled(NavLink)`
  color: rgba(255, 255, 255, 0.55);
  font-family: Nunito;
  letter-spacing: -0.63px;
  padding-top: 4;

  &:hover {
    color: white;
    text-decoration: none;
  }
`
const StyledExternalLink = styled(ExternalNavLink)`
  color: rgba(255, 255, 255, 0.55);
  font-family: Nunito;
  letter-spacing: -0.63px;
  padding-top: 4;

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
            href="https://www.instagram.com/mapletestimony/?hl=en"
            style={{ borderRadius: 50, padding: 8, margin: 5 }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/images/instagram.svg"
              alt="Instagram Icon"
              width="24"
              height="24"
            ></Image>
          </Button>
          <Button
            variant="light"
            style={{ borderRadius: 50, padding: 8, margin: 5 }}
            href="https://twitter.com/MapleTestimony"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/images/twitter.svg"
              alt="Twitter Icon"
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
              alt="LinkedIn Icon"
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
          alt="MAPLE logo"
          width={100}
        />
      </Row>
    </div>
  )
}

const ResourcesLinks = () => {
  const { t } = useTranslation("footer")
  return (
    <>
      <StyledExternalLink href="https://malegislature.gov/Search/FindMyLegislator">
        {t("links.resourcesLegislators")}
      </StyledExternalLink>
      <StyledExternalLink href="https://github.com/codeforboston/maple">
        {t("links.resourcesGitHub")}
      </StyledExternalLink>
      <StyledExternalLink href="https://opencollective.com/mapletestimony">
        {t("links.resourcesOpenCollective")}
      </StyledExternalLink>
    </>
  )
}

const BrowseLinks = () => {
  const { t } = useTranslation("common")
  return (
    <>
      <StyledInternalLink href="/bills">
        {t("navigation.browseBills")}
      </StyledInternalLink>
      <StyledInternalLink href="/testimony">
        {t("navigation.browseTestimony")}
      </StyledInternalLink>
    </>
  )
}

const OurTeamLinks = () => {
  const { t } = useTranslation("footer")
  return (
    <>
      <StyledExternalLink href="https://www.nulawlab.org">
        {t("links.teamNEU")}
      </StyledExternalLink>
      <StyledExternalLink href="https://www.codeforboston.org/">
        {t("links.teamCFB")}
      </StyledExternalLink>
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
      <StyledInternalLink href="/learn/communicating-with-legislators">
        {t("links.learnLegislators")}
      </StyledInternalLink>
      <StyledInternalLink href="/learn/additional-resources">
        {t("navigation.additionalResources", { ns: "common" })}
      </StyledInternalLink>
    </>
  )
}

const AboutLinks = () => {
  const { t } = useTranslation("common")
  return (
    <>
      <StyledInternalLink href="/about/mission-and-goals">
        {t("navigation.missionAndGoals")}
      </StyledInternalLink>
      <StyledInternalLink href="/about/our-team">
        {t("team")}
      </StyledInternalLink>
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
          <CustomDropdown title={t("headers.browse")}>
            <BrowseLinks />
          </CustomDropdown>
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
            <ResourcesLinks />
          </CustomDropdown>

          <CustomDropdown title={t("team", { ns: "common" })}>
            <OurTeamLinks />
          </CustomDropdown>
        </Nav>
      </Navbar>
      <div className={`d-none d-md-flex order-1 flex-grow-1`}>
        <Col>
          <TextHeader>{t("headers.browse")}</TextHeader>
          <BrowseLinks />
          <TextHeader>{t("headers.account")}</TextHeader>

          <AccountLinks {...props} />
        </Col>
        <Col>
          <TextHeader>{t("learn", { ns: "common" })}</TextHeader>
          <LearnLinks />
          <TextHeader>{t("about", { ns: "common" })}</TextHeader>
          <AboutLinks />
        </Col>
        <Col>
          <TextHeader>{t("headers.resources")}</TextHeader>
          <ResourcesLinks />
          <TextHeader>{t("team", { ns: "common" })}</TextHeader>
          <OurTeamLinks />
        </Col>
      </div>
      <MapleContainer className={`col-auto order-md-2 justify-self-end `} />
      <div
        className={`d-flex flex-column gap-2 flex-md-row flex-wrap col-12 flex-shrink-0 order-md-3 text-center text-md-start`}
      >
        <Col className="text-white col-md-auto">{t("legal.disclaimer")}</Col>
        <Col className="text-center">
          <StyledInternalLink href="/policies">
            {t("legal.TOS")}
          </StyledInternalLink>
        </Col>
        <Col className="">
          <StyledInternalLink
            href="https://cdn.forms-content.sg-form.com/fc8a7d49-d903-11ed-9e53-c2519c5b83a4"
            other={{
              target: "_blank",
              rel: "noopener noreferrer"
            }}
          >
            {t("Click here to subscribe to our newsletter")}
          </StyledInternalLink>
        </Col>
      </div>
    </FooterContainer>
  )
}

export default PageFooter
