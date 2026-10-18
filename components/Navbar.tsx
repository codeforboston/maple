import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useIsomorphicLayoutEffect, useMediaQuery } from "usehooks-ts"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import { Col, Container, Dropdown, Nav, Navbar, NavDropdown } from "./bootstrap"
import { flags } from "./featureFlags"
import { useHtmlAttribute } from "./shared/useHtmlAttribute"

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
  NavbarLinkLobbying,
  NavbarLinkProcess,
  NavbarLinkWhyUse,
  NavbarLinkEditProfile,
  NavbarLinkFAQ,
  NavbarLinkGoals,
  NavbarLinkInTheNews,
  NavbarLinkLogo,
  NavbarMobileContext,
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

export const MainNavbar: React.FC<{ variant?: NavbarVariant }> = ({
  variant
}) => {
  const narrow = useMediaQuery("(max-width: 768px)")
  const { pathname } = useRouter()
  const { authenticated } = useAuth()

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

  // Digital Democracy and Mixed: the bar collapses to the hamburger whenever
  // its links do not fit, rather than at a set width, so it follows whichever
  // links are showing (feature flags, signed in or not). DesktopNav reports
  // the window width its links need when they overflow; narrower than that,
  // the mobile bar shows. Maple keeps main's 768px.
  const dd = useHtmlAttribute("data-maple-theme") === "dd"
  // A measurement holds only for the links it was taken with.
  const linksKey = `${dd}|${resolved}|${authenticated}`
  const [fit, setFit] = useState<{ linksKey: string; needed: number } | null>(
    null
  )
  const fitsFrom = fit?.linksKey === linksKey ? fit.needed : null
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window === "undefined" ? 0 : window.innerWidth
  )

  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const handleOverflow = useCallback(
    (needed: number) => {
      setWindowWidth(window.innerWidth)
      setFit({ linksKey, needed })
    },
    [linksKey]
  )

  const isMobile = narrow || (dd && fitsFrom !== null && windowWidth < fitsFrom)

  // Pinned everywhere except the homepage, where the bar scrolls away with the
  // hero, and, under Digital Democracy only (not Mixed), the four explorers
  // and the Learn and About sections.
  const ddOnly = useHtmlAttribute("data-maple-theme") === "dd" && !mixed
  const sectionGround =
    isLearnOrAbout(pathname) || SECTION_GROUND_PAGES.includes(pathname)
  const pinned =
    !isHome && !(ddOnly && (EXPLORERS.includes(pathname) || sectionGround))

  return (
    <NavbarMobileContext.Provider value={isMobile}>
      {isMobile ? (
        <MobileNav variant={resolved} sectionGround={sectionGround} />
      ) : (
        <DesktopNav
          variant={resolved}
          pinned={pinned}
          sectionGround={sectionGround}
          onOverflow={dd ? handleOverflow : undefined}
        />
      )}
    </NavbarMobileContext.Provider>
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
        {flags().lobbyingTable ? (
          <NavbarLinkLobbying handleClick={closeNav} />
        ) : null}
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
      // Never laid out open: under Digital Democracy and Mixed this bar can
      // show at any width (MainNavbar). Below 992px, where Maple shows it, this
      // is the same as expand="lg".
      expand={false}
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
      <Col className="mobile-navbar-account d-flex justify-content-end me-3 pe-2">
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
  /** Called with the window width the links need, when they overflow. */
  onOverflow?: (needed: number) => void
}> = ({ variant, pinned, sectionGround, onOverflow }) => {
  const { authenticated } = useAuth()
  const { t } = useTranslation(["common", "auth"])

  // Measured before paint, and again whenever the bar or its links change
  // size (applied before the next paint), so an overflowing bar is not shown.
  // The links do not wrap or shrink while this is on (styles/globals.css), so
  // not fitting shows up as overflow.
  const barRef = useRef<HTMLDivElement>(null)
  useIsomorphicLayoutEffect(() => {
    const bar = barRef.current
    if (!onOverflow || !bar) return
    const overflow = () => bar.scrollWidth - bar.clientWidth
    if (overflow() > 0) onOverflow(window.innerWidth + overflow())
    const observer = new ResizeObserver(() => {
      const over = overflow()
      if (over > 0) flushSync(() => onOverflow(window.innerWidth + over))
    })
    observer.observe(bar)
    Array.from(bar.children).forEach(child => observer.observe(child))
    return () => observer.disconnect()
  }, [onOverflow])

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
      <div
        ref={barRef}
        className={`desktop-navbar-bar align-items-center d-flex gap-2`}
        data-measure-fit={onOverflow ? "" : undefined}
      >
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

          {flags().lobbyingTable ? (
            <div className={`align-self-center`}>
              <NavbarLinkLobbying />
            </div>
          ) : null}

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
