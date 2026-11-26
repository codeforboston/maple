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

/**
 * The navbar, footer and auth modal around every page. The page's title and
 * other head tags are set by `PageHead` (see `applyLayout`), because nothing
 * here reaches the server-rendered HTML.
 */
export const Layout: React.FC<React.PropsWithChildren<unknown>> = ({
  children
}) => {
  const { authenticated, user } = useAuth()

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
          <FollowContext.Provider value={{ followStatus, setFollowStatus }}>
            <PageContainer>
              <a href="#main-content" className="skip-link">
                Skip to main content
              </a>
              <MainNavbar />
              <AuthModal />
              <main id="main-content" className="col" tabIndex={-1}>
                {children}
              </main>
              <footer>
                <PageFooter
                  authenticated={authenticated}
                  user={user as any}
                  signOut={signOutAndRedirectToHome}
                />
              </footer>
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
