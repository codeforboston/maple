import { useTranslation } from "next-i18next"
import Head from "next/head"
import React, { FC, useEffect, useState } from "react"
import { useMediaQuery } from "usehooks-ts"
import { signOutAndRedirectToHome, useAuth } from "./auth"
import AuthModal from "./auth/AuthModal"
import { DesktopNav } from "./DesktopNav"
import PageFooter from "./Footer/Footer"
import { MobileNav } from "./MobileNav"

export const PageContainer: FC<React.PropsWithChildren<unknown>> = ({
  children
}) => {
  return <div className={`vh-100 d-flex flex-column`}>{children}</div>
}

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

  // isClient used to prevent hydration issues: quite possibly better solutions exist

  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      {isClient ? (
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
      ) : (
        <>
          {/* <p>'This is never prerendered -> part of the isClient hydration fix'</p> */}
        </>
      )}
    </>
  )
}
