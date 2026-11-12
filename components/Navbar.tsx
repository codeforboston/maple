import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import React, { useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
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
 * The site navbar's one look, the neutral bar: a light band with the long
 * navy logo and dark links. Set on the bar as data-navbar-variant, which
 * styles/globals.css keys its rules to.
 */
const NAVBAR_VARIANT = "auto"

export const MainNavbar: React.FC = () => {
  // The bar collapses to the hamburger at 768px and below. Above that, links
  // that don't fit fold into a Browse More menu (DesktopNav) instead.
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { pathname } = useRouter()

  // Pinned everywhere except the homepage, where the bar scrolls away with the
  // hero, and the Conference Committees pages (the page, the explorer and
  // each conference), where it scrolls away, so a conference's own title and
  // tabs hold at the top, keeping its shadow there.
  const conference =
    pathname === "/conferences" ||
    pathname === "/conferences/explorer" ||
    pathname === "/conferences/[court]/[id]"
  const pinned = pathname !== "/" && !conference
  // A shadow under the bar everywhere but the homepage, on desktop and
  // mobile alike, pinned or not (navbar-shadow, styles/globals.css).
  const shadow = pathname !== "/"

  return (
    <NavbarMobileContext.Provider value={isMobile}>
      {isMobile ? (
        <MobileNav shadow={shadow} />
      ) : (
        <DesktopNav pinned={pinned} shadow={shadow} />
      )}
    </NavbarMobileContext.Provider>
  )
}

const MobileNav: React.FC<{
  /** The bar's shadow (navbar-shadow). */
  shadow?: boolean
}> = ({ shadow = false }) => {
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
        <NavDropdown className={"navLink-primary"} title={t("learn")}>
          <NavbarLinkEffective handleClick={closeNav} />
          <NavbarLinkProcess handleClick={closeNav} />
          <NavbarLinkWhyUse handleClick={closeNav} />
          <NavbarLinkAiTools handleClick={closeNav} />
        </NavDropdown>

        <NavDropdown className={"navLink-primary"} title={t("about")}>
          <NavbarLinkGoals handleClick={closeNav} />
          <NavbarLinkTeam handleClick={closeNav} />
          <NavbarLinkSupport handleClick={closeNav} />
          <NavbarLinkInTheNews handleClick={closeNav} />
          <NavbarLinkFAQ handleClick={closeNav} />
          <NavbarLinkPolicies handleClick={closeNav} />
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
      className={`main-navbar w-100 ${isExpanded ? "pb-0" : ""} ${
        shadow ? "navbar-shadow" : ""
      }`}
      data-navbar-variant={NAVBAR_VARIANT}
      style={{ backgroundColor: "var(--maple-navbar-bg)" }}
      data-bs-theme="dark"
      // Never laid out open: this bar shows only at 768px and below
      // (MainNavbar).
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
  pinned: boolean
  /** The bar's shadow (navbar-shadow), pinned or not. */
  shadow?: boolean
}> = ({ pinned, shadow = false }) => {
  const { authenticated } = useAuth()
  const { t } = useTranslation(["common", "auth"])

  // How much of the bar folds into the Browse More menu, by how much room its
  // links have: 0, none (every link on the bar); 1, Conference Committees and
  // Lobbying; 2, Hearings and Testimony as well. Bills always stays out. The
  // bar is measured at each step, before paint and whenever it or its links
  // change size; when its links overflow, the window width they need at that
  // step is kept, and below it the next step is taken. The links do not shrink
  // while measured (styles/globals.css), so not fitting shows up as overflow.
  // Measurements hold only for the links they were taken with.
  const barRef = useRef<HTMLDivElement>(null)
  const linksKey = `${authenticated}`
  const [fit, setFit] = useState<{
    linksKey: string
    needed: (number | undefined)[]
  } | null>(null)
  const needed = fit?.linksKey === linksKey ? fit.needed : []
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window === "undefined" ? 0 : window.innerWidth
  )
  const LAST_STEP = 2
  let folded = 0
  while (
    folded < LAST_STEP &&
    needed[folded] !== undefined &&
    windowWidth < needed[folded]!
  )
    folded++

  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useIsomorphicLayoutEffect(() => {
    const bar = barRef.current
    if (!bar || folded === LAST_STEP) return
    const measure = () => {
      const over = bar.scrollWidth - bar.clientWidth
      if (over > 0) {
        setWindowWidth(window.innerWidth)
        setFit(prev => {
          const kept = prev?.linksKey === linksKey ? [...prev.needed] : []
          kept[folded] = window.innerWidth + over
          return { linksKey, needed: kept }
        })
      }
    }
    measure()
    const observer = new ResizeObserver(() => flushSync(measure))
    observer.observe(bar)
    Array.from(bar.children).forEach(child => observer.observe(child))
    return () => observer.disconnect()
  }, [linksKey, folded])

  // Pinned, the bar always casts its shadow (sticky-top, styles/globals.css);
  // unpinned with `shadow`, it keeps it (navbar-shadow).
  return (
    <Container
      fluid
      className={`main-navbar desktop-navbar d-flex py-2 ${
        pinned ? "sticky-top" : ""
      } ${shadow ? "navbar-shadow" : ""} justify-content-end gap-2`}
      data-navbar-variant={NAVBAR_VARIANT}
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
          {/* Bills, then the rest on the bar while there's room for them, in
              the bar's order (Conference Committees next to Bills):
              Conference Committees and Lobbying go into Browse More first,
              then Hearings and Testimony (folded, above). */}
          <div className={`align-self-center`}>
            <NavbarLinkBills />
          </div>

          {flags().ballotQuestions ? (
            <div className={`align-self-center`}>
              <NavbarLinkBallotQuestions />
            </div>
          ) : null}

          {folded < 1 && flags().conferences ? (
            <div className={`align-self-center`}>
              <NavbarLinkConferences />
            </div>
          ) : null}

          {folded < 2 ? (
            <>
              {flags().hearingsAndTranscriptions ? (
                <div className={`align-self-center`}>
                  <NavbarLinkHearings />
                </div>
              ) : null}
              <div className="align-self-center">
                <NavbarLinkTestimony />
              </div>
            </>
          ) : null}

          {folded < 1 && flags().lobbyingTable ? (
            <div className={`align-self-center`}>
              <NavbarLinkLobbying />
            </div>
          ) : null}

          {/* Only with something in it. */}
          {folded === 2 ||
          (folded === 1 && (flags().conferences || flags().lobbyingTable)) ? (
            <div className={`align-self-center`}>
              <Dropdown>
                <Dropdown.Toggle
                  variant="light"
                  className={`${DESKTOP_NAV_ITEM_CLASS}`}
                >
                  {t("more")}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {flags().conferences ? (
                    <NavbarLinkConferences dropdown />
                  ) : null}
                  {folded === 2 && flags().hearingsAndTranscriptions ? (
                    <NavbarLinkHearings dropdown />
                  ) : null}
                  {folded === 2 ? <NavbarLinkTestimony dropdown /> : null}
                  {flags().lobbyingTable ? (
                    <NavbarLinkLobbying dropdown />
                  ) : null}
                </Dropdown.Menu>
              </Dropdown>
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
