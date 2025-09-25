import { useAuth } from "components/auth"
import { App } from "components/moderation"
import { createPage } from "components/page"
import { useRouter } from "next/router"
import { useEffect } from "react"

// const Admin: NextPage = () => requireAdmin()
// return <App />

export default createPage({
  titleI18nKey: "titles.admin",
  Page: requireAdmin(() => <App />)
})

function requireAdmin(Component: React.FC<{}>) {
  return function ProtectedRoute() {
    const { claims } = useAuth()
    const router = useRouter()

    // TODO: This will cause a blank screen to show for logged out users, but
    //       a redirect to the home page for logged-in non-admin users.
    //       This should ideally be a consistent experience for both sets of users,
    //       but not worth the effort to implement right now.
    //       Worth revisiting if we either expand our admins or add more admin-only pages.
    useEffect(() => {
      if (claims && claims?.role !== "admin") {
        router.push({ pathname: "/" })
      }
    }, [claims, router])

    console.log({ claims })
    return claims?.role === "admin" ? <Component /> : null
  }
}
