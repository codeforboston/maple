import { requireAuth } from "../components/auth"
import { createPage } from "../components/page"
import { EditProfile } from "../components/EditProfilePage/EditProfilePage"

export default createPage({
  title: "Profile",
  Page: requireAuth(({ user }) => {
    return <EditProfile />
  })
})

// this must only be on pages in the pages folder
// it will throw an error if it's in the components folder
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "footer",
        "editProfile"
      ]))
      // Will be passed to the page component as props
    }
  }
}
