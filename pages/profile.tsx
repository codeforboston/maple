import { createPage } from "../components/page"
import { ProfilePage } from "../components/ProfilePage/Profile"

export default createPage({
  title: "Profile",
  Page: () => {
    return <ProfilePage />
  }
})

