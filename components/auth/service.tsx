import { User } from "firebase/auth"
import { useRouter } from "next/router"
import React, { useEffect } from "react"
import { auth } from "../firebase"
import { useAppDispatch } from "../hooks"
import { createService } from "../service"
import { authChanged, useAuth } from "./redux"
import { Claim } from "./types"

export const { Provider } = createService(() => {
  const dispatch = useAppDispatch()
  useEffect(
    () =>
      auth.onAuthStateChanged(async user => {
        let claims: Claim | undefined = undefined
        if (user) {
          const token = await user.getIdTokenResult()
          const fromToken = Claim.validate(token.claims)
          if (fromToken.success) claims = fromToken.value
        }
        dispatch(authChanged({ user, claims }))
      }),
    [dispatch]
  )
})

/**
 * Renders the given component if authenticated, otherwise redirects.
 */
export function requireAuth(Component: React.FC<{ user: User }>) {
  return function ProtectedRoute() {
    const { user } = useAuth()
    const router = useRouter()
    useEffect(() => {
      if (user === null) {
        router.push({ pathname: "/" })
      }
    }, [router, user])

    return user ? <Component user={user} /> : null
  }
}
