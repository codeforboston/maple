import { useTranslation } from "next-i18next"
import React from "react"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import { Container, Dropdown, Nav, NavDropdown } from "./bootstrap"
import { useProfile } from "./db"
import { NavLink } from "./Navlink"

import {
  Avatar,
  NavbarLinkBills,
  NavbarLinkEditProfile,
  NavbarLinkEffective,
  NavbarLinkFAQ,
  NavbarLinkGoals,
  NavbarLinkLogo,
  NavbarLinkProcess,
  NavbarLinkSignOut,
  NavbarLinkSupport,
  NavbarLinkTeam,
  NavbarLinkTestimony,
  NavbarLinkViewProfile
} from "./NavbarComponents"

export const DesktopNav: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { authenticated, user } = useAuth()
  const { t } = useTranslation(["common", "auth"])
  const userLink = "/profile?id=" + user?.uid

  const result = useProfile()
  let isOrg = result?.profile?.role === "organization"

  return (
    <Container fluid className={`bg-secondary d-flex py-2 sticky-top`}>
      <NavbarLinkLogo />

      <div className={`align-self-center flex-grow-1 invisible`}>
        <button className={`bg-light col my-2 w-100`}>
          <div className={`text-dark`}>Placeholder Search Widget</div>
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

      <div className={`align-self-center`}>
        <Dropdown>
          <Dropdown.Toggle className={`btn-secondary text-white-50`}>
            {t("about")}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NavbarLinkGoals />
            <NavbarLinkTeam />
            <NavbarLinkSupport />

            {/* delete this after the link is relocated to the Footer */}

            {/* <NavDropdown.Item>
              <NavLink href="/policies">
                {t("navigation.privacyAndConduct")}
              </NavLink>
            </NavDropdown.Item> */}

            <NavbarLinkFAQ />
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
            {/* <NavDropdown.Item>
              <NavLink href="/learn/legislative-process">
                {t("navigation.legislativeProcess")}
              </NavLink>
            </NavDropdown.Item> */}
            <NavbarLinkProcess />

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
              <Avatar isOrg={isOrg} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <NavDropdown.Item>
                <NavbarLinkViewProfile userLink={userLink} />
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
