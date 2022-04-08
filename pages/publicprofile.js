import { createPage } from "../components/page"
import PublicProfile from "../components/PublicProfile/PublicProfile"
import { useRouter } from "next/router"

export default createPage({
  v2: true,
  title: "Public Profile",
  Page: () => {
    const router = useRouter(),
      id = router.query.id,
      billId = typeof id === "string" ? id : null

    return <PublicProfile id={id} />
  }
})
