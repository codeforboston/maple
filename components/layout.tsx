import { useTranslation } from "next-i18next"
import Head from "next/head"
import React, { FC, useEffect, useState } from "react"
import { signOutAndRedirectToHome, useAuth } from "./auth"
import AuthModal from "./auth/AuthModal"
import PageFooter from "./Footer/Footer"
import { MainNavbar } from "./Navbar"
import { FollowContext, OrgFollowStatus } from "./shared/FollowContext"

export const PageContainer: FC<React.PropsWithChildren<unknown>> = ({
  children
}) => {
  return <div className={`vh-100 d-flex flex-column`}>{children}</div>
}

export type LayoutProps = {
  titleI18nKey?: string
}

export const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = ({
  children,
  titleI18nKey
}) => {
  const { authenticated, user } = useAuth()
  const { t } = useTranslation("common")
  let title = titleI18nKey
    ? `${t(titleI18nKey)} | ${t("maple_abbr")}: ${t("maple_fullName")}`
    : `${t("maple_abbr")}: ${t("maple_fullName")}`

  // isClient used to prevent hydration issues: quite possibly better solutions exist

  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  const [followStatus, setFollowStatus] = useState<OrgFollowStatus>({})

  return (
    <>
      {isClient ? (
        <>
          <Head>
            <title>{title}</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <FollowContext.Provider value={{ followStatus, setFollowStatus }}>
            <PageContainer>
              <MainNavbar />
              <AuthModal />
              <div className={`col`}>{children}</div>
              <PageFooter
                authenticated={authenticated}
                user={user as any}
                signOut={signOutAndRedirectToHome}
              />
            </PageContainer>
          </FollowContext.Provider>
        </>
      ) : (
        <>
          {/* <p>'This is never prerendered -> part of the isClient hydration fix'</p> */}
        </>
      )}
    </>
  )
}
