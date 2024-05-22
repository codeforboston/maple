import { useTranslation } from "next-i18next"
import React from "react"
import Image from "react-bootstrap/Image"
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

  return (
    <Container fluid className={`bg-secondary d-flex py-2 sticky-top`}>
      <div className={`align-items-center justify-content-start me-3`}>
        <Nav.Link href="/" className={`py-0 px-2`}>
          <Image src="/Logo2024.png" alt="logo" width="80" height="80" />
        </Nav.Link>
      </div>

      <div className={`align-self-center flex-grow-1 invisible`}>
        <button className={`bg-light col my-2 w-100`}>
          <div className={`text-dark`}>Placeholder Search Widget</div>
        </button>
      </div>

      <div className={`align-self-center ms-3`}>
        <Nav>
          <NavLink className={`text-white-50`} href="/bills">
            {t("navigation.browseBills")}
          </NavLink>
        </Nav>
      </div>

      <div className="align-self-center">
        <Nav>
          <NavLink className={"text-white-50"} href="/testimony">
            {t("navigation.browseTestimony")}
          </NavLink>
        </Nav>
      </div>

      <div className={`align-self-center`}>
        <Dropdown>
          <Dropdown.Toggle className={`btn-secondary text-white-50`}>
            {t("about")}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NavDropdown.Item>
              <NavLink href="/about/mission-and-goals">
                {t("navigation.missionAndGoals")}
              </NavLink>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <NavLink href="/about/our-team">{t("navigation.team")}</NavLink>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <NavLink href="/about/support-maple">
                {t("navigation.supportMaple")}
              </NavLink>
            </NavDropdown.Item>

            {/* delete this after the link is relocated to the Footer */}

            {/* <NavDropdown.Item>
              <NavLink href="/policies">
                {t("navigation.privacyAndConduct")}
              </NavLink>
            </NavDropdown.Item> */}
            <NavDropdown.Item>
              <NavLink href="/about/faq-page">{t("navigation.faq")}</NavLink>
            </NavDropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className={`align-self-center justify-content-end`}>
        <Dropdown>
          <Dropdown.Toggle className={`btn-secondary text-white-50`}>
            {t("learn")}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NavDropdown.Item>
              <NavLink href="/learn/to-write-effective-testimony">
                {t("navigation.toWriteEffectiveTestimony")}
              </NavLink>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <NavLink href="/learn/legislative-process">
                {t("navigation.legislativeProcess")}
              </NavLink>
            </NavDropdown.Item>

            {/* These 3 `Why Use...` links will be comboed into one link when their corresponding page is refactored */}

            <NavDropdown.Item>
              <NavLink href="/why-use-maple/for-individuals">
                {t("navigation.forIndividuals")}
              </NavLink>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <NavLink href="/why-use-maple/for-orgs">
                {t("navigation.forOrganizations")}
              </NavLink>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <NavLink href="/why-use-maple/for-legislators">
                {t("navigation.forLegislators")}
              </NavLink>
            </NavDropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {authenticated ? (
        <div className={`align-self-center justify-content-end`}>
          <Dropdown>
            <Dropdown.Toggle className={`btn-secondary`}>
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
                  handleClick={() => {
                    location.assign(userLink)
                  }}
                >
                  View Profile
                </NavLink>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavLink href="/editprofile">Edit Profile</NavLink>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavLink
                  handleClick={() => {
                    void signOutAndRedirectToHome()
                  }}
                >
                  Sign Out
                </NavLink>
              </NavDropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      ) : (
        <div className={`align-self-center justify-content-end`}>
          <SignInWithButton />
        </div>
      )}
    </Container>
  )
}
