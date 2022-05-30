import { useRouter } from "next/router"
import { createPage } from "../components/page"
import PublicProfile from "../components/PublicProfile/PublicProfile"

export default createPage({
  title: "Public Profile",
  Page: () => {
    const router = useRouter(),
      id = router.query.id,
      billId = typeof id === "string" ? id : null

    return <PublicProfile id={id} />
  }
})
