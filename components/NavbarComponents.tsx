import { useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "./auth"
import { Nav, NavDropdown } from "./bootstrap"
import { NavLink } from "./Navlink"

export const Avatar = ({ isOrg }: { isOrg: boolean }) => {
  return (
    <>
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
    </>
  )
}

export const NavbarLinkBills: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth"])
  return (
    <Nav.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : "text-white-50"}
        href="/bills"
        {...other}
      >
        {t("navigation.browseBills")}
      </NavLink>
    </Nav.Item>
  )
}

export const NavbarLinkEditProfile: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth", "profile"])
  return (
    <Nav.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : ""}
        href="/editprofile"
        {...other}
      >
        {t("navigation.editProfile")}
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
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavDropdown.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : ""}
        href="/learn/to-write-effective-testimony"
        {...other}
      >
        {t("navigation.toWriteEffectiveTestimony")}
      </NavLink>
    </NavDropdown.Item>
  )
}

export const NavbarLinkFAQ: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavDropdown.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : ""}
        href="/about/faq-page"
        {...other}
      >
        {t("navigation.faq")}
      </NavLink>
    </NavDropdown.Item>
  )
}

export const NavbarLinkGoals: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavDropdown.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : ""}
        href="/about/mission-and-goals"
        {...other}
      >
        {t("navigation.missionAndGoals")}
      </NavLink>
    </NavDropdown.Item>
  )
}

export const NavbarLinkLogo: React.FC<
  React.PropsWithChildren<{
    other?: any
  }>
> = ({ other }) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth"])
  return (
    <div
      className={
        isMobile ? "" : "align-items-center justify-content-start me-3"
      }
    >
      <NavLink className={isMobile ? "" : "py-0 px-2"} href="/" {...other}>
        <Image
          src="/Logo2024.png"
          alt={t("navigation.logo")}
          className={isMobile ? "w-100" : ""}
          width={isMobile ? "60" : "80"}
          height={isMobile ? "60" : "80"}
        />
      </NavLink>
    </div>
  )
}

export const NavbarLinkProcess: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavDropdown.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : ""}
        href="/learn/legislative-process"
        {...other}
      >
        {t("navigation.legislativeProcess")}
      </NavLink>
    </NavDropdown.Item>
  )
}

export const NavbarLinkSignOut: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavLink
      className={isMobile ? "navLink-primary" : ""}
      handleClick={handleClick}
      {...other}
    >
      {t("navigation.signOut")}
    </NavLink>
  )
}

export const NavbarLinkSupport: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavDropdown.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : ""}
        href="/about/support-maple"
        {...other}
      >
        {t("navigation.supportMaple")}
      </NavLink>
    </NavDropdown.Item>
  )
}

export const NavbarLinkTeam: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavDropdown.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : ""}
        href="/about/our-team"
        {...other}
      >
        {t("navigation.team")}
      </NavLink>
    </NavDropdown.Item>
  )
}

export const NavbarLinkTestimony: React.FC<
  React.PropsWithChildren<{
    handleClick?: any
    other?: any
  }>
> = ({ handleClick, other }) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth"])
  return (
    <Nav.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : "text-white-50"}
        href="/testimony"
        {...other}
      >
        {t("navigation.browseTestimony")}
      </NavLink>
    </Nav.Item>
  )
}

export const NavbarLinkViewProfile: React.FC<
  React.PropsWithChildren<{
    other?: any
  }>
> = ({ other }) => {
  const { user } = useAuth()
  const userLink = "/profile?id=" + user?.uid
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavLink
      className={isMobile ? "navLink-primary" : ""}
      handleClick={() => {
        location.assign(userLink)
      }}
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
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation(["common", "auth"])
  return (
    <NavDropdown.Item onClick={handleClick}>
      <NavLink
        className={isMobile ? "navLink-primary" : ""}
        href="/why-use-maple/for-individuals"
        {...other}
      >
        {t("navigation.whyUseMaple")}
      </NavLink>
    </NavDropdown.Item>
  )
}
