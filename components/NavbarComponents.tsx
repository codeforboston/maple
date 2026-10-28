import { useTranslation } from "next-i18next"
import { createContext, useContext } from "react"
import { useRouter } from "next/router"
import Image from "react-bootstrap/Image"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "./auth"
import { Nav, NavDropdown } from "./bootstrap"
import { useProfile } from "./db"
import { NavLink } from "./Navlink"
import { maple, Wrap } from "./links"
import { BetaTag } from "./shared/CommonComponents"

export const DESKTOP_NAV_ITEM_CLASS = "desktop-navbar-link px-3 py-1"

/**
 * Whether the navbar is in its mobile (hamburger) layout. MainNavbar provides
 * it, since under Digital Democracy and Mixed that turns on whether the bar's
 * links fit, not on the width alone. Outside the navbar, the width decides.
 */
export const NavbarMobileContext = createContext<boolean | null>(null)

const useNavbarIsMobile = () => {
  const fromNavbar = useContext(NavbarMobileContext)
  const narrow = useMediaQuery("(max-width: 768px)")
  return fromNavbar ?? narrow
}

const NavbarDropdownLink: React.FC<
  React.PropsWithChildren<{
    href: string
    handleClick?: any
    className?: string
    other?: any
  }>
> = ({ href, handleClick, className, children, other }) => {
  const router = useRouter()
  const isActive =
    router.asPath.split("?")[0] === href.split("?")[0] ||
    router.pathname === href

  return (
    <Wrap href={href}>
      <NavDropdown.Item
        active={isActive}
        onClick={handleClick}
        className={className}
        {...other}
      >
        {children}
      </NavDropdown.Item>
    </Wrap>
  )
}

const NavbarDropdownAction: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    className?: string
    other?: any
  }>
> = ({ handleClick, className, children, other }) => (
  <NavDropdown.Item
    as="button"
    type="button"
    onClick={handleClick}
    className={className}
    {...other}
  >
    {children}
  </NavDropdown.Item>
)

export const Avatar = () => {
  const { t } = useTranslation("profile")
  const result = useProfile()
  let isOrg = result?.profile?.role === "organization"

  const kind = isOrg ? "org" : "individual"

  // White for the blue bar, blue for the neutral one; styles/globals.css shows
  // the one that suits the bar, as it does the logos. One alt between them,
  // since only one is ever shown.
  return (
    <>
      <Image
        className="navbar-avatar-light"
        src={`/profile-${kind}-white.svg`}
        alt={t("profileMenu")}
        width="35"
        height="35"
      />
      <Image
        className="navbar-avatar-dark"
        src={`/profile-${kind}-blue.svg`}
        alt={t("profileMenu")}
        width="35"
        height="35"
      />
    </>
  )
}

export const NavbarLinkAiTools: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavbarDropdownLink
      className={isMobile ? "navLink-primary" : ""}
      href="/learn/ai-tools"
      handleClick={handleClick}
      other={other}
    >
      {t("navigation.aiTools")}
    </NavbarDropdownLink>
  )
}

export const NavbarLinkAI: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavbarDropdownLink
      // Maple only: Digital Democracy and Mixed list it under Policies.
      className={`maple-only ${isMobile ? "navLink-primary" : ""}`}
      href="/about/how-maple-uses-ai"
      handleClick={handleClick}
      other={other}
    >
      {t("navigation.ai")}
    </NavbarDropdownLink>
  )
}

export const NavbarLinkBills: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <Nav.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : DESKTOP_NAV_ITEM_CLASS}
        href="/bills"
        {...other}
      >
        {t("navigation.bills")}
      </NavLink>
    </Nav.Item>
  )
}

export const NavbarLinkLobbying: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <Nav.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : DESKTOP_NAV_ITEM_CLASS}
        href="/lobbying"
        {...other}
      >
        {t("navigation.lobbying")}
        <BetaTag>{t("beta_feature")}</BetaTag>
      </NavLink>
    </Nav.Item>
  )
}

export const NavbarLinkBallotQuestions: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <Nav.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : DESKTOP_NAV_ITEM_CLASS}
        href="/ballotQuestions"
        {...other}
      >
        {t("navigation.ballotQuestions")}
      </NavLink>
    </Nav.Item>
  )
}

export const NavbarLinkConferences: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth"])
  const { pathname } = useRouter()
  return (
    <Nav.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : DESKTOP_NAV_ITEM_CLASS}
        href={maple.conferences()}
        // The landing, the explorer and every conference are this section.
        other={{
          active: pathname.startsWith(maple.conferences()),
          ...other
        }}
      >
        {t("navigation.conferences")}
      </NavLink>
    </Nav.Item>
  )
}

export const NavbarLinkHearings: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <Nav.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : DESKTOP_NAV_ITEM_CLASS}
        href="/hearings"
        {...other}
      >
        {t("navigation.hearings")}
      </NavLink>
    </Nav.Item>
  )
}

export const NavbarLinkEditProfile: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
    tab: string
    dropdown?: boolean
  }>
> = ({ handleClick, other, tab, dropdown = false }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth", "profile"])
  const href =
    tab == "navigation.editProfile"
      ? "/edit-profile/about-you"
      : "/edit-profile/following"

  if (dropdown && !isMobile) {
    return (
      <NavbarDropdownLink href={href} handleClick={handleClick} other={other}>
        {t(tab)}
      </NavbarDropdownLink>
    )
  }

  return (
    <Nav.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : ""}
        href={href}
        {...other}
      >
        {t(tab)}
      </NavLink>
    </Nav.Item>
  )
}

export const NavbarLinkEffective: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavbarDropdownLink
      className={isMobile ? "navLink-primary" : ""}
      href="/learn/testimony"
      handleClick={handleClick}
      other={other}
    >
      {t("navigation.aboutTestimony")}
    </NavbarDropdownLink>
  )
}

export const NavbarLinkWritingTestimony: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavbarDropdownLink
      // Maple only: Digital Democracy and Mixed list it in the footer's Other
      // Resources instead.
      className={`maple-only ${isMobile ? "navLink-primary" : ""}`}
      href="/writing-effective-testimony"
      handleClick={handleClick}
      other={other}
    >
      {t("navigation.writingTestimony")}
    </NavbarDropdownLink>
  )
}

/** Digital Democracy and Mixed only (dd-only, styles/globals.css): the
 * Policies landing page, in the About menu. */
export const NavbarLinkPolicies: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation("footer")
  return (
    <NavbarDropdownLink
      className={`dd-only ${isMobile ? "navLink-primary" : ""}`}
      href="/policies"
      handleClick={handleClick}
      other={other}
    >
      {t("headers.policies")}
    </NavbarDropdownLink>
  )
}

export const NavbarLinkFAQ: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavbarDropdownLink
      className={isMobile ? "navLink-primary" : ""}
      href="/about/faq-page"
      handleClick={handleClick}
      other={other}
    >
      {t("navigation.faq")}
    </NavbarDropdownLink>
  )
}

export const NavbarLinkGoals: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavbarDropdownLink
      className={isMobile ? "navLink-primary" : ""}
      href="/about/mission-and-goals"
      handleClick={handleClick}
      other={other}
    >
      {t("navigation.missionAndGoals")}
    </NavbarDropdownLink>
  )
}

export const NavbarLinkLogo: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <div
      className={
        isMobile ? "" : "align-items-center justify-content-start me-3"
      }
      onClick={handleClick}
    >
      <NavLink className={isMobile ? "" : "py-0 px-2"} href="/" {...other}>
        {/* Two assets rather than one recoloured asset: the logo is a flat
            silhouette with the colour baked in. CSS picks which is visible, so
            the choice stays with the theme. */}
        {/* The Maple skin's blue bar: the logo from main, at main's size. */}
        <Image
          src="/maple-logo-white-no-tagline.svg"
          alt={t("navigation.logo")}
          className={`navbar-logo navbar-logo-original ${
            isMobile ? "w-100" : ""
          }`}
          width={isMobile ? "60" : "80"}
          height={isMobile ? "60" : "80"}
        />
        {/* The blue bar under Digital Democracy (only where a page asks for
            the blue bar outright). */}
        <Image
          src="/logo-ple-blue-bg.svg"
          alt={t("navigation.logo")}
          className={`navbar-logo navbar-logo-light ${isMobile ? "w-100" : ""}`}
          width={isMobile ? "60" : "80"}
          height={isMobile ? "60" : "80"}
        />
        {/* Mixed's blue bar: the blue logo laid out as the neutral bar's is,
            its tree as drawn and the MAPLE word all white
            (/logo-ple-blue-alt3-largealt.svg with the word recoloured). */}
        <Image
          src="/logo-ple-blue-bg-white.svg"
          alt={t("navigation.logo")}
          className={`navbar-logo navbar-logo-mixed ${isMobile ? "w-100" : ""}`}
          width={isMobile ? "60" : "80"}
          height={isMobile ? "60" : "80"}
        />
        <Image
          src="/logo-ple-neutral-bg.svg"
          alt={t("navigation.logo")}
          className={`navbar-logo navbar-logo-dark ${isMobile ? "w-100" : ""}`}
          width={isMobile ? "60" : "80"}
          height={isMobile ? "60" : "80"}
        />
      </NavLink>
    </div>
  )
}

export const NavbarLinkNewsfeed: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth", "profile"])
  return (
    <Nav.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : DESKTOP_NAV_ITEM_CLASS}
        href="/newsfeed"
        {...other}
      >
        {t("navigation.newsfeed")}
      </NavLink>
    </Nav.Item>
  )
}

export const NavbarLinkProcess: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavbarDropdownLink
      className={isMobile ? "navLink-primary" : ""}
      href="/learn/legislative-process"
      handleClick={handleClick}
      other={other}
    >
      {t("navigation.legislativeProcess")}
    </NavbarDropdownLink>
  )
}

export const NavbarLinkSignOut: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
    dropdown?: boolean
  }>
> = ({ handleClick, other, dropdown = false }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])

  if (dropdown && !isMobile) {
    return (
      <NavbarDropdownAction handleClick={handleClick} other={other}>
        {t("navigation.signOut")}
      </NavbarDropdownAction>
    )
  }

  return (
    <Nav.Item>
      <button
        type="button"
        onClick={handleClick}
        className={`nav-link border-0 bg-transparent p-0 ${
          isMobile ? "navLink-primary" : ""
        }`}
        {...other}
      >
        {t("navigation.signOut")}
      </button>
    </Nav.Item>
  )
}

export const NavbarLinkSupport: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavbarDropdownLink
      className={isMobile ? "navLink-primary" : ""}
      href="/about/support-maple"
      handleClick={handleClick}
      other={other}
    >
      {t("navigation.supportMaple")}
    </NavbarDropdownLink>
  )
}

export const NavbarLinkTeam: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavbarDropdownLink
      className={isMobile ? "navLink-primary" : ""}
      href="/about/our-team"
      handleClick={handleClick}
      other={other}
    >
      {t("navigation.team")}
    </NavbarDropdownLink>
  )
}

export const NavbarLinkTestimony: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <Nav.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : DESKTOP_NAV_ITEM_CLASS}
        href="/testimony"
        {...other}
      >
        {t("navigation.testimony")}
      </NavLink>
    </Nav.Item>
  )
}

export const NavbarLinkViewProfile: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
    dropdown?: boolean
  }>
> = ({ handleClick, other, dropdown = false }) => {
  const { user } = useAuth()
  const userLink = "/profile?id=" + user?.uid
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])

  if (dropdown && !isMobile) {
    return (
      <NavbarDropdownLink
        href={userLink}
        handleClick={handleClick}
        other={other}
      >
        {t("navigation.viewProfile")}
      </NavbarDropdownLink>
    )
  }

  return (
    <NavLink
      className={isMobile ? "navLink-primary" : ""}
      handleClick={handleClick}
      href={userLink}
      {...other}
    >
      {t("navigation.viewProfile")}
    </NavLink>
  )
}

export const NavbarLinkWhyUse: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavbarDropdownLink
      className={isMobile ? "navLink-primary" : ""}
      href="/why-use-maple/for-individuals"
      handleClick={handleClick}
      other={other}
    >
      {t("navigation.whyUseMaple")}
    </NavbarDropdownLink>
  )
}

export const NavbarLinkInTheNews: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useNavbarIsMobile()
  const { t } = useTranslation(["common", "auth"])
  return isMobile ? (
    <NavDropdown.Item onClick={handleClick}>
      <NavLink className="navLink-primary" href="/about/in-the-news" {...other}>
        {t("navigation.inTheNews")}
      </NavLink>
    </NavDropdown.Item>
  ) : (
    <NavbarDropdownLink
      href="/about/in-the-news"
      handleClick={handleClick}
      other={other}
    >
      {t("navigation.inTheNews")}
    </NavbarDropdownLink>
  )
}
