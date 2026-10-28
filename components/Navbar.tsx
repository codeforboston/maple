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

import {
  Avatar,
  NavbarLinkBallotQuestions,
  NavbarLinkConferences,
  DESKTOP_NAV_ITEM_CLASS,
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
  NavbarLinkViewProfile
} from "./NavbarComponents"

const MobileCollapse = styled(Navbar.Collapse)`
  background-color: var(--maple-navbar-bg);
`

/**
 * The site navbar's look, set as data-navbar-variant for styles/globals.css.
 *
 * - "auto", the default: the neutral bar, as the site shows it.
 * - "neutral": a light band with the long navy logo and dark links.
 * - "blue": the blue bar. No page uses it; it is kept for the Navbar story
 *   (stories/organisms/Navbar.stories.tsx).
 */
export type NavbarVariant = "blue" | "neutral" | "auto"

export const MainNavbar: React.FC<{ variant?: NavbarVariant }> = ({
  variant = "auto"
}) => {
  const narrow = useMediaQuery("(max-width: 768px)")
  const { pathname } = useRouter()
  const { authenticated } = useAuth()

  // The bar collapses to the hamburger whenever its links do not fit, rather
  // than at a set width, so it follows whichever links are showing (feature
  // flags, signed in or not). DesktopNav reports the window width its links
  // need when they overflow; narrower than that, the mobile bar shows. At
  // 768px and below it always does.
  // A measurement holds only for the links it was taken with.
  const linksKey = `${variant}|${authenticated}`
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

  const isMobile = narrow || (fitsFrom !== null && windowWidth < fitsFrom)

  // Pinned everywhere except the homepage, where the bar scrolls away with the
  // hero.
  const pinned = pathname !== "/"

  return (
    <NavbarMobileContext.Provider value={isMobile}>
      {isMobile ? (
        <MobileNav variant={variant} />
      ) : (
        <DesktopNav
          variant={variant}
          pinned={pinned}
          onOverflow={handleOverflow}
        />
      )}
    </NavbarMobileContext.Provider>
  )
}

const MobileNav: React.FC<{
  variant: NavbarVariant
}> = ({ variant }) => {
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
        {flags().conferences ? (
          <NavbarLinkConferences handleClick={closeNav} />
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
          <NavbarLinkPolicies handleClick={closeNav} />
        </NavDropdown>

        <NavDropdown className={"navLink-primary"} title={t("learn")}>
          <NavbarLinkEffective handleClick={closeNav} />
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
      style={{ backgroundColor: "var(--maple-navbar-bg)" }}
      data-bs-theme="dark"
      // Never laid out open: this bar shows at any width where the desktop
      // links do not fit (MainNavbar).
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
  /** Called with the window width the links need, when they overflow. */
  onOverflow: (needed: number) => void
}> = ({ variant, pinned, onOverflow }) => {
  const { authenticated } = useAuth()
  const { t } = useTranslation(["common", "auth"])

  // Measured before paint, and again whenever the bar or its links change
  // size (applied before the next paint), so an overflowing bar is not shown.
  // The links do not wrap or shrink while this is on (styles/globals.css), so
  // not fitting shows up as overflow.
  const barRef = useRef<HTMLDivElement>(null)
  useIsomorphicLayoutEffect(() => {
    const bar = barRef.current
    if (!bar) return
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

  // Pinned, the bar always casts its shadow (sticky-top, styles/globals.css).
  return (
    <Container
      fluid
      className={`main-navbar desktop-navbar d-flex py-2 ${
        pinned ? "sticky-top" : ""
      } justify-content-end gap-2`}
      data-navbar-variant={variant}
      style={{ backgroundColor: "var(--maple-navbar-bg)" }}
    >
      {/* Logo, nav items and the sign-in action share one container, set to
          the page's content column (styles/globals.css) and measured above to
          tell whether the links fit. */}
      <div
        ref={barRef}
        className={`desktop-navbar-bar align-items-center d-flex gap-2`}
        data-measure-fit=""
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

          {flags().conferences ? (
            <div className={`align-self-center`}>
              <NavbarLinkConferences />
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
