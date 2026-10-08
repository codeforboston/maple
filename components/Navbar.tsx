import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import { Col, Container, Dropdown, Nav, Navbar, NavDropdown } from "./bootstrap"
import { flags } from "./featureFlags"

import {
  Avatar,
  NavbarLinkBallotQuestions,
  DESKTOP_NAV_ITEM_CLASS,
  NavbarLinkAI,
  NavbarLinkPolicies,
  NavbarLinkBills,
  NavbarLinkAiTools,
  NavbarLinkEffective,
  NavbarLinkHearings,
  NavbarLinkProcess,
  NavbarLinkWhyUse,
  NavbarLinkEditProfile,
  NavbarLinkFAQ,
  NavbarLinkGoals,
  NavbarLinkInTheNews,
  NavbarLinkLogo,
  NavbarLinkNewsfeed,
  NavbarLinkSignOut,
  NavbarLinkSupport,
  NavbarLinkTeam,
  NavbarLinkTestimony,
  NavbarLinkWritingTestimony,
  NavbarLinkViewProfile
} from "./NavbarComponents"

const MobileCollapse = styled(Navbar.Collapse)`
  background-color: var(--maple-navbar-bg);
`

/**
 * The site navbar comes in two looks:
 *
 * - "blue": the current MAPLE bar, a brand-blue band with the white logo and
 *   white links.
 * - "neutral": the Digital Democracy bar, a light band with the long navy logo
 *   and dark links.
 *
 * "auto" follows the skin: neutral under the Digital Democracy skin, blue
 * otherwise. The styles key off data-navbar-variant in styles/globals.css.
 */
export type NavbarVariant = "blue" | "neutral" | "auto"

/** The Learn and About sections (Policies counts as About, and the writing
 * guide, out of /learn, as Learn), whose bar is not pinned under Digital
 * Democracy. */
const isLearnOrAbout = (pathname: string) =>
  [
    "/learn",
    "/about",
    "/why-use-maple",
    "/policies",
    "/writing-effective-testimony"
  ].some(section => pathname === section || pathname.startsWith(`${section}/`))

/** The four explorers. Their bar is not pinned under Digital Democracy, and
 * the dev switcher's art row (components/DevSkinToggle.tsx) shows only on
 * them. */
export const EXPLORERS = [
  "/bills",
  "/hearings",
  "/testimony",
  "/ballotQuestions"
]

/** Pages outside Learn and About that take their look under Digital
 * Democracy: the section's ground on page and bar (styles/globals.css). Now
 * the four explorers. Each page also renders SectionGround
 * (components/shared/SectionGround.tsx) for its own ground. */
export const SECTION_GROUND_PAGES = EXPLORERS

/**
 * Reads an attribute on <html> and follows changes to it, so switching skins
 * at runtime (Storybook, or the dev switcher) re-renders the navbar.
 */
const useHtmlAttribute = (name: string, enabled = true) => {
  // Read straight away where there is a document (the layout only renders in
  // the browser), so the first render already has the value and nothing jumps.
  const [value, setValue] = useState<string | null>(() =>
    enabled && typeof document !== "undefined"
      ? document.documentElement.getAttribute(name)
      : null
  )

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    const read = () => setValue(root.getAttribute(name))
    read()
    const observer = new MutationObserver(read)
    observer.observe(root, { attributes: true, attributeFilter: [name] })
    return () => observer.disconnect()
  }, [name, enabled])

  return value
}

export const MainNavbar: React.FC<{ variant?: NavbarVariant }> = ({
  variant
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { pathname } = useRouter()

  // By default the bar follows the skin ("auto"): neutral under the Digital
  // Democracy skin, blue under Maple. The "mixed" skin (data-maple-nav="mixed",
  // alongside Digital Democracy) is neutral on the homepage only and blue
  // everywhere else.
  const isHome = pathname === "/"
  const mixed = useHtmlAttribute("data-maple-nav") === "mixed"
  const pageDefault: NavbarVariant = mixed
    ? isHome
      ? "neutral"
      : "blue"
    : "auto"

  const resolved = variant ?? pageDefault

  // Pinned everywhere except the homepage, where the bar scrolls away with the
  // hero, and, under Digital Democracy only (not Mixed), the four explorers
  // and the Learn and About sections.
  const ddOnly = useHtmlAttribute("data-maple-theme") === "dd" && !mixed
  const sectionGround =
    isLearnOrAbout(pathname) || SECTION_GROUND_PAGES.includes(pathname)
  const pinned =
    !isHome && !(ddOnly && (EXPLORERS.includes(pathname) || sectionGround))

  return (
    <>
      {isMobile ? (
        <MobileNav variant={resolved} sectionGround={sectionGround} />
      ) : (
        <DesktopNav
          variant={resolved}
          pinned={pinned}
          sectionGround={sectionGround}
        />
      )}
    </>
  )
}

/* sectionGround marks the pages on the Learn and About ground (Learn, About,
   Policies, the writing guide and SECTION_GROUND_PAGES; data-section-ground),
   whose bar takes that ground under Digital Democracy (styles/globals.css). */
const MobileNav: React.FC<{
  variant: NavbarVariant
  sectionGround: boolean
}> = ({ variant, sectionGround }) => {
  const ProfileLinks = () => {
    return (
      <Nav className="my-4 d-flex align-items-start">
        <NavbarLinkViewProfile handleClick={closeNav} />
        <NavbarLinkEditProfile
          handleClick={() => {
            closeNav()
          }}
          tab={"navigation.editProfile"}
        />
        <NavbarLinkEditProfile
          handleClick={() => {
            closeNav()
          }}
          tab={"navigation.followingTab"}
        />
        <NavbarLinkSignOut
          handleClick={() => {
            closeNav()
            void signOutAndRedirectToHome()
          }}
        />
      </Nav>
    )
  }

  const SiteLinks = () => {
    return (
      <Nav className="my-4">
        <NavbarLinkBills handleClick={closeNav} />
        {flags().ballotQuestions ? (
          <NavbarLinkBallotQuestions handleClick={closeNav} />
        ) : null}
        {flags().hearingsAndTranscriptions ? (
          <NavbarLinkHearings handleClick={closeNav} />
        ) : null}
        <NavbarLinkTestimony handleClick={closeNav} />
        {authenticated ? <NavbarLinkNewsfeed handleClick={closeNav} /> : <></>}
        <NavDropdown className={"navLink-primary"} title={t("about")}>
          <NavbarLinkGoals handleClick={closeNav} />
          <NavbarLinkTeam handleClick={closeNav} />
          <NavbarLinkSupport handleClick={closeNav} />
          <NavbarLinkInTheNews handleClick={closeNav} />
          <NavbarLinkFAQ handleClick={closeNav} />
          <NavbarLinkAI handleClick={closeNav} />
          <NavbarLinkPolicies handleClick={closeNav} />
        </NavDropdown>

        <NavDropdown className={"navLink-primary"} title={t("learn")}>
          <NavbarLinkEffective handleClick={closeNav} />
          <NavbarLinkWritingTestimony handleClick={closeNav} />
          <NavbarLinkProcess handleClick={closeNav} />
          <NavbarLinkWhyUse handleClick={closeNav} />
          <NavbarLinkAiTools handleClick={closeNav} />
        </NavDropdown>
      </Nav>
    )
  }

  const { authenticated } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [whichMenu, setWhichMenu] = useState("site")
  const { t } = useTranslation(["common", "auth"])

  const toggleSite = () => {
    if (isExpanded && whichMenu == "profile") {
      setWhichMenu("site")
    } else {
      setWhichMenu("site")
      setIsExpanded(!isExpanded)
    }
  }

  const toggleAvatar = () => {
    if (isExpanded && whichMenu == "site") {
      setWhichMenu("profile")
    } else {
      setWhichMenu("profile")
      setIsExpanded(!isExpanded)
    }
  }

  const closeNav = () => setIsExpanded(false)

  return (
    <Navbar
      className={`main-navbar w-100 ${isExpanded ? "pb-0" : ""}`}
      data-navbar-variant={variant}
      data-section-ground={sectionGround ? "" : undefined}
      style={{ backgroundColor: "var(--maple-navbar-bg)" }}
      data-bs-theme="dark"
      expand="lg"
      expanded={isExpanded}
    >
      <Col className="ms-3 ps-2">
        <button
          type="button"
          onClick={toggleSite}
          aria-controls="basic-navbar-nav"
          aria-expanded={isExpanded && whichMenu === "site"}
          aria-label={
            isExpanded && whichMenu === "site"
              ? t("navigation.closeNavMenu")
              : t("navigation.openNavMenu")
          }
          className="mobile-nav-trigger"
        >
          {isExpanded && whichMenu == "site" ? (
            <span className="mobile-nav-close-icon" aria-hidden="true" />
          ) : (
            <span className="navbar-toggler-icon" aria-hidden="true" />
          )}
        </button>
      </Col>
      <Col className="d-flex justify-content-center">
        <NavbarLinkLogo handleClick={closeNav} />
      </Col>
      <Col className="d-flex justify-content-end me-3 pe-2">
        {authenticated ? (
          <button
            type="button"
            onClick={toggleAvatar}
            aria-controls="basic-navbar-nav"
            aria-expanded={isExpanded && whichMenu === "profile"}
            aria-label={
              isExpanded && whichMenu === "profile"
                ? t("navigation.closeProfileMenu")
                : t("navigation.openProfileMenu")
            }
            className="mobile-nav-trigger"
          >
            <span
              className="p-0 d-inline-flex"
              style={{ color: "var(--maple-brand-primary-strong)" }}
            >
              {isExpanded && whichMenu == "profile" ? (
                <span className="mobile-nav-close-icon" aria-hidden="true" />
              ) : (
                <Avatar />
              )}
            </span>
          </button>
        ) : (
          <SignInWithButton />
        )}
      </Col>

      <MobileCollapse id="basic-navbar-nav" className="mt-2 ps-4">
        {/* while MAPLE is trying to do away with inline styling,   *
         *  both styled-components and bootstrap classes have been  *
         *  ignoring height properties for some reason              */}
        <div style={{ height: "100vh" }}>
          {whichMenu == "site" ? <SiteLinks /> : <ProfileLinks />}
        </div>
      </MobileCollapse>
    </Navbar>
  )
}

const DesktopNav: React.FC<{
  variant: NavbarVariant
  pinned: boolean
  sectionGround: boolean
}> = ({ variant, pinned, sectionGround }) => {
  const { authenticated } = useAuth()
  const { t } = useTranslation(["common", "auth"])

  // While pinned, the bar casts a shadow once the page has scrolled at all,
  // which is when content starts passing underneath it. At the top there is
  // nothing under it, so no shadow.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    if (!pinned) {
      setScrolled(false)
      return
    }
    const update = () => setScrolled(window.scrollY > 0)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [pinned])

  return (
    <Container
      fluid
      className={`main-navbar desktop-navbar d-flex py-2 ${
        pinned ? "sticky-top" : ""
      } ${scrolled ? "navbar-scrolled" : ""} justify-content-end gap-2`}
      data-navbar-variant={variant}
      data-section-ground={sectionGround ? "" : undefined}
      style={{ backgroundColor: "var(--maple-navbar-bg)" }}
    >
      {/* Logo, nav items and the sign-in action share one container, so the
          Digital Democracy skin can seat the whole lot on its own surface and
          leave the bar itself transparent. */}
      <div className={`desktop-navbar-bar align-items-center d-flex gap-2`}>
        <div className={`me-auto`}>
          <NavbarLinkLogo />
        </div>

        <div className={`desktop-navbar-items align-items-center d-flex gap-2`}>
          <div className={`align-self-center`}>
            <NavbarLinkBills />
          </div>

          {flags().ballotQuestions ? (
            <div className={`align-self-center`}>
              <NavbarLinkBallotQuestions />
            </div>
          ) : null}

          {flags().hearingsAndTranscriptions ? (
            <div className={`align-self-center`}>
              <NavbarLinkHearings />
            </div>
          ) : (
            <></>
          )}

          <div className="align-self-center">
            <NavbarLinkTestimony />
          </div>

          {authenticated ? (
            <div className="align-self-center">
              <NavbarLinkNewsfeed />
            </div>
          ) : (
            <></>
          )}

          <div className={`align-self-center`}>
            <Dropdown>
              <Dropdown.Toggle
                variant="light"
                className={`${DESKTOP_NAV_ITEM_CLASS}`}
              >
                {t("about")}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <NavbarLinkGoals />
                <NavbarLinkTeam />
                <NavbarLinkSupport />
                <NavbarLinkInTheNews />
                <NavbarLinkFAQ />
                <NavbarLinkAI />
                <NavbarLinkPolicies />
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className={`align-self-center`}>
            <Dropdown>
              <Dropdown.Toggle
                variant="light"
                className={`${DESKTOP_NAV_ITEM_CLASS}`}
              >
                {t("learn")}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <NavbarLinkEffective />
                <NavbarLinkWritingTestimony />
                <NavbarLinkProcess />
                <NavbarLinkWhyUse />
                <NavbarLinkAiTools />
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {authenticated ? (
            <div className={`desktop-navbar-account align-self-center`}>
              <Dropdown>
                <Dropdown.Toggle
                  variant="light"
                  className={`desktop-navbar-dropdown`}
                >
                  <Avatar />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <NavbarLinkViewProfile dropdown />
                  <NavbarLinkEditProfile
                    dropdown
                    tab={"navigation.editProfile"}
                  />
                  <NavbarLinkEditProfile
                    dropdown
                    tab={"navigation.followingTab"}
                  />
                  <NavbarLinkSignOut
                    dropdown
                    handleClick={() => {
                      void signOutAndRedirectToHome()
                    }}
                  />
                </Dropdown.Menu>
              </Dropdown>
            </div>
          ) : (
            <div className={`desktop-navbar-account align-self-center`}>
              <SignInWithButton />
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
