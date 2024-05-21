import { useTranslation } from "next-i18next"
import React from "react"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import { Container, Dropdown, Nav, NavDropdown } from "./bootstrap"
import { useProfile } from "./db"
import { NavLink } from "./Navlink"

export const DesktopNav: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { authenticated, user } = useAuth()
  const { t } = useTranslation(["common", "auth"])
  const userLink = "/profile?id=" + user?.uid

  const result = useProfile()
  let isOrg = result?.profile?.role === "organization"

  const LogoBox = styled.div`
    width: 100px;
  `

  const BrowseBox = styled.div`
    width: 126px;
  `

  const TestimonyBox = styled.div`
    width: 170px;
  `

  const AboutBox = styled.div`
    width: 90px;
  `

  const LearnBox = styled.div`
    width: 90px;
  `

  const ProfileBox = styled.div`
    width: 96px;
  `

  const LoginBox = styled.div`
    width: 150px;
  `

  return (
    <Container fluid className={`bg-secondary d-flex py-2 sticky-top`}>
      <LogoBox className={`align-items-center justify-content-start me-3`}>
        <Nav.Link href="/" className="py-0 px-2">
          <Image src="/Logo2024.png" alt="logo" width="80" height="80" />
        </Nav.Link>
      </LogoBox>

      <div className={`align-self-center flex-grow-1 invisible`}>
        <button className={`bg-light col my-2 w-100`}>
          <div className={`text-dark`}>Placeholder Search Widget</div>
        </button>
      </div>

      <BrowseBox className="align-self-center ms-3">
        <Nav>
          <NavLink className={"navLink-primary text-white-50"} href="/bills">
            {t("navigation.browseBills")}
          </NavLink>
        </Nav>
      </BrowseBox>

      <TestimonyBox className="align-self-center">
        <Nav>
          <NavLink
            className={"navLink-primary text-white-50"}
            href="/testimony"
          >
            {t("navigation.browseTestimony")}
          </NavLink>
        </Nav>
      </TestimonyBox>

      <AboutBox className="align-self-center">
        <Dropdown>
          <Dropdown.Toggle className="btn-secondary text-white-50">
            {t("about")}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NavDropdown.Item>
              <NavLink
                href="/about/mission-and-goals"
                className={"navLink-primary"}
              >
                {t("navigation.missionAndGoals")}
              </NavLink>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <NavLink href="/about/our-team" className={"navLink-primary"}>
                {t("navigation.team")}
              </NavLink>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <NavLink
                href="/about/support-maple"
                className={"navLink-primary"}
              >
                {t("navigation.supportMaple")}
              </NavLink>
            </NavDropdown.Item>

            {/* delete this after the link is relocated to the Footer */}

            {/* <NavDropdown.Item>
              <NavLink href="/policies" className={"navLink-primary"}>
                {t("navigation.privacyAndConduct")}
              </NavLink>
            </NavDropdown.Item> */}
            <NavDropdown.Item>
              <NavLink href="/about/faq-page" className={"navLink-primary"}>
                {t("navigation.faq")}
              </NavLink>
            </NavDropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </AboutBox>

      <LearnBox className="align-self-center justify-content-end">
        <Dropdown>
          <Dropdown.Toggle className="btn-secondary text-white-50">
            {t("learn")}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NavDropdown.Item>
              <NavLink
                href="/learn/to-write-effective-testimony"
                className={"navLink-primary"}
              >
                {t("navigation.toWriteEffectiveTestimony")}
              </NavLink>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <NavLink
                href="/learn/legislative-process"
                className={"navLink-primary"}
              >
                {t("navigation.legislativeProcess")}
              </NavLink>
            </NavDropdown.Item>

            {/* These 3 `Why Use...` links will be comboed into one link when their corresponding page is refactored */}

            <NavDropdown.Item>
              <NavLink
                href="/why-use-maple/for-individuals"
                className={"navLink-primary"}
              >
                {t("navigation.forIndividuals")}
              </NavLink>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <NavLink
                href="/why-use-maple/for-orgs"
                className={"navLink-primary"}
              >
                {t("navigation.forOrganizations")}
              </NavLink>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <NavLink
                className={"navLink-primary"}
                href="/why-use-maple/for-legislators"
              >
                {t("navigation.forLegislators")}
              </NavLink>
            </NavDropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </LearnBox>

      {authenticated ? (
        <ProfileBox className={`align-self-center justify-content-end`}>
          <Dropdown>
            <Dropdown.Toggle className="btn-secondary">
              {isOrg ? (
                <Image
                  src="/profile-org-white.svg"
                  alt="profile icon"
                  width="35"
                  height="35"
                />
              ) : (
                <Image
                  src="/profile-individual-white.svg"
                  alt="profile icon"
                  width="35"
                  height="35"
                />
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <NavDropdown.Item>
                <NavLink
                  className={"navLink-primary"}
                  handleClick={() => {
                    location.assign(userLink)
                  }}
                >
                  View Profile
                </NavLink>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavLink className={"navLink-primary"} href="/editprofile">
                  Edit Profile
                </NavLink>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavLink
                  className={"navLink-primary"}
                  handleClick={() => {
                    void signOutAndRedirectToHome()
                  }}
                >
                  Sign Out
                </NavLink>
              </NavDropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </ProfileBox>
      ) : (
        <LoginBox className={`align-self-center justify-content-end`}>
          <SignInWithButton />
        </LoginBox>
      )}
    </Container>
  )
}
