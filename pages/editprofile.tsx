import { createPage } from "../components/page"
import { requireAuth, useAuth } from "../components/auth"
import { useProfile } from "../components/db"
import { useRouter } from "next/router"
import { EditProfile } from "../components/ProfilePage/EditProfilePage"

export default createPage({
  title: "Profile",
  Page: requireAuth(({ user: { displayName } }) => {
    const { profile, loading } = useProfile()

    const { user } = useAuth()
    const uid = user?.uid

    const individual = !profile?.organization
    const router = useRouter()

    return <EditProfile />
  })
})
