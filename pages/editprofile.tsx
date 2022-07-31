import { requireAuth } from "../components/auth"
import { createPage } from "../components/page"
import { EditProfile } from "../components/ProfilePage/EditProfilePage"

export default createPage({
  title: "Profile",
  Page: requireAuth(({ user }) => {
    return <EditProfile />
  })
})
