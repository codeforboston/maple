import { useTranslation } from "next-i18next"
import Head from "next/head"
import React, { FC, useEffect, useState } from "react"
import Image from "react-bootstrap/Image"
import { useMediaQuery } from "usehooks-ts"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import AuthModal from "./auth/AuthModal"
import { Container, Nav, NavDropdown, Navbar } from "./bootstrap"
import { useProfile } from "./db"
import { DesktopNav } from "./DesktopNav"
import PageFooter from "./Footer/Footer"
import { MobileNav } from "./MobileNav"
import { NavLink } from "./Navlink"
import ProfileLink from "./ProfileLink"

export type LayoutProps = {
  title?: string
}

export const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = ({
  children,
  title
}) => {
  const { authenticated, user } = useAuth()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { t } = useTranslation("common")
  const formattedTitle = title
    ? `${title} | ${t("maple_abbr")}: ${t("maple_fullName")}`
    : `${t("maple_abbr")}: ${t("maple_fullName")}`

  return (
    <>
      <Head>
        <title>{formattedTitle}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageContainer>
        {isMobile ? <MobileNav /> : <DesktopNav />}
        <AuthModal />
        <div className={`col`}>{children}</div>
        <PageFooter
          authenticated={authenticated}
          user={user as any}
          signOut={signOutAndRedirectToHome}
        />
      </PageContainer>
    </>
  )
}

export const PageContainer: FC<React.PropsWithChildren<unknown>> = ({
  children
}) => {
  return <div className={`vh-100 d-flex flex-column`}>{children}</div>
}

export const NavBarBoxContainer: FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <div
      className={`d-flex flex-row, align-items-start justify-content-between w-100`}
    >
      {children}
    </div>
  )
}

export const NavBarBox: FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className
}) => {
  return (
    <div
      className={`col d-flex justify-content-start align-items-center ${className}`}
    >
      {children}
    </div>
  )
}
