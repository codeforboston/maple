import { User } from "firebase/auth"
import { useRouter } from "next/router"
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"
import { Literal as L, Record, Static, Union } from "runtypes"
import { auth } from "../firebase"

// TODO: share with functions
export const Role = Union(
  L("user"),
  L("admin"),
  L("legislator"),
  L("organization")
)
export type Role = Static<typeof Role>

/** Custom-claim payload used for authorization. */
export const Claims = Record({
  role: Role
})
export type Claims = Static<typeof Claims>

interface AuthState {
  /** null if the user is signed out, undefined if the auth state hasn't been
   * initialized */
  user: User | null | undefined
  /** Only set if authenticated */
  claims?: Claims
  /** True iff user is signed in */
  authenticated: boolean
}

const AuthContext = createContext<AuthState>(undefined!)

export const AuthProvider: React.FC = ({ children }) => {
  const auth = useAuthenticationHook()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

function useAuthenticationHook(): AuthState {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [claims, setClaims] = useState<Claims | undefined>(undefined)
  useEffect(
    () =>
      auth.onAuthStateChanged(async user => {
        let claims: Claims | undefined = undefined
        if (user) {
          const token = await user.getIdTokenResult()
          const fromToken = Claims.validate(token.claims)
          if (fromToken.success) claims = fromToken.value
        }
        setClaims(claims)
        setUser(user)
      }),
    []
  )
  return useMemo(
    () => ({
      user,
      claims,
      authenticated: !!user
    }),
    [claims, user]
  )
}

/**
 * Renders the given component if authenticated, otherwise redirects.
 */
export function requireAuth(Component: React.FC<{ user: User }>) {
  return function ProtectedRoute() {
    const { user } = useAuth()
    const router = useRouter()
    useEffect(() => {
      if (user === null) {
        router.push({ pathname: "/login", query: { r: router.asPath } })
      }
    }, [router, user])

    return user ? <Component user={user} /> : null
  }
}
