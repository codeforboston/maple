import { useRouter } from "next/router"
import { Container } from "../components/bootstrap"
import { createPage } from "../components/page"
import { ProfilePage } from "../components/ProfilePage/Profile"

export default createPage({
  title: "Public Profile",
  Page: () => {
    const router = useRouter()
    const id = router.query.id

    return <ProfilePage id={id} />
  }
})
