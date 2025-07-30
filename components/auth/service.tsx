import { useProfile } from "components/db"
import { useProfileState } from "components/db/profile/redux"
import { User } from "firebase/auth"
import Router, { useRouter } from "next/router"
import React, { useCallback, useEffect, useRef } from "react"
import { auth } from "../firebase"
import { useAppDispatch } from "../hooks"
import { createService } from "../service"
import { authChanged, useAuth, setJustLoggedOut } from "./redux"
import { Claim } from "./types"

export const { Provider } = createService(() => {
  const dispatch = useAppDispatch()
  const getToken = useGetTokenWithRefresh()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      let claims: Claim | undefined = undefined
      if (user) {
        let token = await getToken(user)
        const fromToken = Claim.validate(token.claims)
        if (fromToken.success) claims = fromToken.value
      }
      dispatch(authChanged({ user, claims }))
    })
    return () => {
      unsubscribe()
    }
  }, [dispatch, getToken])
})

/**
 * The token does not refresh when the user's profile or claims in firebase auth change,
 * So we need to manually refresh it if the user's profile or claims change.
 * It's always possible (but a bug) that the profile is out of sync with the auth database,
 * so we need to avoid refresh loops by only refreshing once per service instance.
 */
const useGetTokenWithRefresh = () => {
  const hasRefreshedToken = useRef(false)
  const profile = useProfileState(),
    hasProfile = !profile.loading,
    roleInProfile = profile.profile?.role

  return useCallback(
    async (user: User) => {
      let token = await user.getIdTokenResult()

      const isRoleOutOfSyncInToken =
          hasProfile && roleInProfile !== token.claims.role,
        isEmailVerifiedOutOfSyncInToken =
          user.emailVerified !== Boolean(token.claims.email_verified),
        isTokenOutOfSync =
          isRoleOutOfSyncInToken || isEmailVerifiedOutOfSyncInToken

      // If the profile has a role but the token doesn't, try refreshing the token.
      // If the user indicates email is verified but the token doesn't, try refreshing the token.
      // Only refresh once per service instance.
      if (isTokenOutOfSync && !hasRefreshedToken.current) {
        console.log(
          "Refreshing token because it is out of sync with profile or user"
        )
        token = await user.getIdTokenResult(true)
        hasRefreshedToken.current = true
      }

      return token
    },
    [hasProfile, roleInProfile]
  )
}

/**
 * Renders the given component if authenticated, otherwise redirects.
 */
export function requireAuth(
  Component: React.FC<React.PropsWithChildren<{ user: User }>>
) {
  return function ProtectedRoute() {
    const { user, loading, justLoggedOut } = useAuth()
    const router = useRouter()
    useEffect(() => {
      if (!loading && user === null) {
        router.push({ pathname: "/" })
      }
    }, [router, user, loading])

    return user ? <Component user={user} /> : null
  }
}

/**
 * Redirects user after logging out.
 */
export async function signOutAndRedirectToHome() {
  await auth.signOut()
  Router.push("/")
}

/**
 * Custom hook to handle logout with justLoggedOut flag.
 */
export function useLogoutWithDelay() {
  const dispatch = useAppDispatch()
  return async () => {
    dispatch(setJustLoggedOut(true))
    Router.push("/").then(() => {
      setTimeout(async () => {
        await auth.signOut()
        setTimeout(() => {
          dispatch(setJustLoggedOut(false))
        }, 2000)
      }, 200)
    })
  }
}
