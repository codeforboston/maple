import { requireAuth } from "../components/auth"
import { createPage } from "../components/page"
import { EditProfile } from "../components/EditProfilePage/EditProfilePage"
import { createGetStaticTranslationProps } from "components/translations"

/* identical to editprofile.tsx except that the mobile Nav link to *
 * Following Tab needs a unique url otherwise both Edit Profile    *
 * and Following Tab will light up when either one is selected     */

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
  "footer",
  "testimony"
])
