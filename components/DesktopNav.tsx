import { useFlags } from "components/featureFlags"
import { useTranslation } from "next-i18next"
import React from "react"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import { Container, Dropdown, Nav, NavDropdown } from "./bootstrap"

import {
  Avatar,
  NavbarLinkAI,
  NavbarLinkBills,
  NavbarLinkEditProfile,
  NavbarLinkEffective,
  NavbarLinkFAQ,
  NavbarLinkGoals,
  NavbarLinkLogo,
  NavbarLinkNewsfeed,
  NavbarLinkProcess,
  NavbarLinkSignOut,
  NavbarLinkSupport,
  NavbarLinkTeam,
  NavbarLinkTestimony,
  NavbarLinkViewProfile,
  NavbarLinkWhyUse
} from "./NavbarComponents"

export const DesktopNav: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { authenticated } = useAuth()
  const { t } = useTranslation(["common", "auth"])
  const { notifications } = useFlags()

  return (
    <Container fluid className={`bg-secondary d-flex py-2 sticky-top`}>
      <NavbarLinkLogo />

      <div className={`align-self-center flex-grow-1 invisible`}>
        <button className={`bg-light col my-2 w-100`}>
          <div className={`text-dark`}>{"Placeholder Search Widget"}</div>
        </button>
      </div>

      <div className={`align-self-center ms-3`}>
        <Nav>
          <NavbarLinkBills />
        </Nav>
      </div>

      <div className="align-self-center">
        <Nav>
          <NavbarLinkTestimony />
        </Nav>
      </div>

      {notifications ? (
        <div className="align-self-center">
          <Nav>
            <NavbarLinkNewsfeed />
          </Nav>
        </div>
      ) : (
        <></>
      )}

      <div className={`align-self-center`}>
        <Dropdown>
          <Dropdown.Toggle className={`btn-secondary text-white-50`}>
            {t("about")}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NavbarLinkGoals />
            <NavbarLinkTeam />
            <NavbarLinkSupport />
            <NavbarLinkFAQ />
            <NavbarLinkAI />
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className={`align-self-center justify-content-end`}>
        <Dropdown>
          <Dropdown.Toggle className={`btn-secondary text-white-50`}>
            {t("learn")}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NavbarLinkEffective />
            <NavbarLinkProcess />
            <NavbarLinkWhyUse />
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {authenticated ? (
        <div className={`align-self-center justify-content-end`}>
          <Dropdown>
            <Dropdown.Toggle className={`btn-secondary`}>
              <Avatar />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <NavDropdown.Item>
                <NavbarLinkViewProfile />
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavbarLinkEditProfile />
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavbarLinkSignOut
                  handleClick={() => {
                    void signOutAndRedirectToHome()
                  }}
                />
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
