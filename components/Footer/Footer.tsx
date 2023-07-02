import { authStepChanged } from "components/auth/redux"
import { useAppDispatch } from "components/hooks"
import { User } from "firebase/auth"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { Button, Col, Nav, Navbar, Row } from "../bootstrap"
import { ExternalNavLink, NavLink } from "../Navlink"
import CustomDropdown from "./CustomFooterDropdown"
import styles from "./Footer.module.css"
import { FooterContainer } from "./FooterContainer"
import { useTranslation } from "next-i18next"

export type PageFooterProps = {
  children?: any
  authenticated: boolean
  user: User | null | undefined
  signOut: () => void
}

const TextHeader = styled.p`
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  font-family: Nunito;
  padding: 0.5rem 1rem 0 1rem;
  margin: 0;
`

function MapleContainer() {
  const { t } = useTranslation("footer")
  return (
    <div style={{ maxWidth: "220px" }}>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
            </svg>
          </Button>
          <Button
            variant="light"
            style={{ borderRadius: 50, padding: 8, margin: 5 }}
            href="https://twitter.com/MapleTestimony"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
            </svg>
          </Button>
          <Button
            variant="light"
            style={{ borderRadius: 50, padding: 8, margin: 5 }}
            href="https://www.linkedin.com/company/maple-testimony"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/Linked In.svg"
              alt="LinkedIn Icon"
              width="24"
              height="24"
            ></img>
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
      <ExternalNavLink
        className={styles.footerLink}
        href="https://malegislature.gov/Search/FindMyLegislator"
      >
        {t("links.resourcesLegislators")}
      </ExternalNavLink>
      <ExternalNavLink
        className={styles.footerLink}
        href="https://github.com/codeforboston/maple"
      >
        {t("links.resourcesGitHub")}
      </ExternalNavLink>
      <ExternalNavLink
        className={styles.footerLink}
        href="https://opencollective.com/mapletestimony"
      >
        {t("links.resourcesOpenCollective")}
      </ExternalNavLink>
    </>
  )
}

const BrowseLinks = () => {
  const { t } = useTranslation("footer")
  return (
    <>
      {/* <NavLink className={styles.footerLink} href="#testimony">
        Testimonies
      </NavLink> */}
      <NavLink className={styles.footerLink} href="/bills">
        {t("links.browseBills")}
      </NavLink>
      <NavLink className={styles.footerLink} href="/testimony">
        {t("links.browseTestimony")}
      </NavLink>
    </>
  )
}

const OurTeamLinks = () => {
  const { t } = useTranslation("footer")
  return (
    <>
      <ExternalNavLink
        href="https://www.nulawlab.org"
        className={styles.footerLink}
      >
        {t("links.teamNEU")}
      </ExternalNavLink>
      <ExternalNavLink
        href="https://www.codeforboston.org/"
        className={styles.footerLink}
      >
        {t("links.teamCFB")}
      </ExternalNavLink>
    </>
  )
}

const AccountLinks = ({ authenticated, user, signOut }: PageFooterProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation("footer")
  return authenticated ? (
    <>
      <NavLink
        href={`${user?.uid ? "/profile?id=" + user?.uid : "/profile"}`}
        other={{ className: `${styles.footerLink}` }}
      >
        {t("links.accountProfile")}
      </NavLink>
      <NavLink
        handleClick={() => signOut()}
        other={{ className: `${styles.footerLink}` }}
      >
        {t("links.accountSignOut")}
      </NavLink>
    </>
  ) : (
    <NavLink
      handleClick={() => dispatch(authStepChanged("start"))}
      other={{ className: `${styles.footerLink}` }}
    >
      {t("links.accountSignIn")}
    </NavLink>
  )
}

const LearnLinks = () => {
  const { t } = useTranslation("footer")
  return (
    <>
      <NavLink
        href="/learn/writing-effective-testimony"
        other={{ className: `${styles.footerLink}` }}
      >
        {t("links.learnWriting")}
      </NavLink>
      <NavLink
        href="/learn/communicating-with-legislators"
        other={{ className: `${styles.footerLink}` }}
      >
        {t("links.learnLegislators")}
      </NavLink>
      <NavLink
        href="/learn/additional-resources"
        other={{ className: `${styles.footerLink}` }}
      >
        {t("links.learnResources")}
      </NavLink>
    </>
  )
}

const AboutLinks = () => {
  const { t } = useTranslation("footer")
  return (
    <>
      <NavLink
        href="/about/mission-and-goals"
        other={{ className: `${styles.footerLink}` }}
      >
        {t("links.aboutMission")}
      </NavLink>
      <NavLink
        href="/about/our-team"
        other={{ className: `${styles.footerLink}` }}
      >
        {t("links.aboutTeam")}
      </NavLink>
    </>
  )
}

const PageFooter = (props: PageFooterProps) => {
  const { t } = useTranslation("footer")
  return (
    <FooterContainer
      fluid
      style={{ backgroundColor: "#000", justifyContent: "center" }}
    >
      <Row style={{ padding: "2.5em 1.5em 0 1.5em" }}>
        <Navbar variant="dark" expand="lg" className="d-md-none">
          <Nav>
            <CustomDropdown title={t("headers.browse")}>
              <BrowseLinks />
            </CustomDropdown>
            <CustomDropdown title={t("headers.account")}>
              <AccountLinks {...props} />
            </CustomDropdown>

            <CustomDropdown title={t("headers.learn")}>
              <LearnLinks />
            </CustomDropdown>

            <CustomDropdown title={t("headers.about")}>
              <AboutLinks />
            </CustomDropdown>

            <CustomDropdown title={t("headers.resources")}>
              <ResourcesLinks />
            </CustomDropdown>

            <CustomDropdown title={t("headers.team")}>
              <OurTeamLinks />
            </CustomDropdown>
          </Nav>
        </Navbar>

        <Col
          className="d-none d-md-flex"
          md={8}
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginRight: "5em"
          }}
        >
          <Col style={{ alignContent: "flex-start" }}>
            <TextHeader>{t("headers.browse")}</TextHeader>
            <BrowseLinks />
            <TextHeader>{t("headers.account")}</TextHeader>
            <AccountLinks {...props} />
          </Col>
          <Col>
            <TextHeader>{t("headers.learn")}</TextHeader>
            <LearnLinks />

            <TextHeader>{t("headers.about")}</TextHeader>
            <AboutLinks />
          </Col>

          <Col md={"auto"}>
            <TextHeader>{t("headers.resources")}</TextHeader>
            <ResourcesLinks />
            <TextHeader>{t("headers.team")}</TextHeader>
            <OurTeamLinks />
          </Col>
        </Col>

        <Col
          className="d-none d-md-flex"
          style={{
            justifyContent: "flex-end",
            marginRight: "1em"
          }}
        >
          {<MapleContainer />}
        </Col>
        <Row
          style={{
            color: "rgba(255, 255, 255, 0.55)",
            margin: "0 0 0 0.05em"
          }}
        >
          <Col
            className="col-auto"
            style={{ marginTop: "0.5em", padding: "0 2.5em 0 0" }}
          >
            <p>{t("legal.disclaimer")}</p>
          </Col>
          <Col className="col">
            <NavLink
              href="/policies"
              other={{ className: `${styles.footerLink}` }}
            >
              {t("legal.TOS")}
            </NavLink>
          </Col>
          <Col className="col">
            <NavLink
              href="https://cdn.forms-content.sg-form.com/fc8a7d49-d903-11ed-9e53-c2519c5b83a4"
              other={{
                className: `${styles.footerLink}`,
                target: "_blank",
                rel: "noopener noreferrer"
              }}
            >
              {t("Click here to subscribe to our newsletter")}
            </NavLink>
          </Col>
        </Row>
        <Col
          className="d-xs-flex d-md-none"
          style={{
            display: "flex",
            justifyContent: "center"
          }}
        >
          {<MapleContainer />}
        </Col>
      </Row>
    </FooterContainer>
  )
}

export default PageFooter
