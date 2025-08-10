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

    useEffect(() => {
      if (claims && claims?.role !== "admin") {
        router.push({ pathname: "/" })
      }
    }, [claims, router])

    console.log({ claims })
    return claims?.role === "admin" ? <Component /> : null
  }
}
