import { User } from "firebase/auth"
import { useRouter } from "next/router"
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"
import { auth } from "../firebase"

interface AuthState {
  /** null if the user is signed out, undefined if the auth state hasn't been
   * initialized */
  user: User | null | undefined
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
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user)
    })

    return unsubscribe
  }, [])
  return useMemo(
    () => ({
      user,
      authenticated: !!user
    }),
    [user]
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
        router.push({ pathname: "/" })
      }
    }, [router, user])

    return user ? <Component user={user} /> : null
  }
}
