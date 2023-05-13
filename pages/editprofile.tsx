import { requireAuth } from "../components/auth"
import { createPage } from "../components/page"
import { EditProfile } from "../components/EditProfilePage/EditProfilePage"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "Profile",
  Page: requireAuth(({ user }) => {
    return <EditProfile />
  })
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "editProfile",
  "footer"
])
