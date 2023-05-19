import { useAuth } from "components/auth"
import { App } from "components/moderation"
import { createPage } from "components/page"
import { useRouter } from "next/router"
import { useEffect } from "react"

// const Admin: NextPage = () => requireAdmin()
// return <App />

export default createPage({
  title: "Admin",
  Page: requireAdmin(() => <App />)
})

function requireAdmin(Component: React.FC<{}>) {
  return function ProtectedRoute() {
    const { user, authenticated, claims } = useAuth()
    const router = useRouter()
    useEffect(() => {
      if (authenticated === true && claims === undefined) {
        router.push({ pathname: "/" })
      }
    }, [user, router, authenticated])

    return claims?.role === "admin" ? <Component /> : null
  }
}
