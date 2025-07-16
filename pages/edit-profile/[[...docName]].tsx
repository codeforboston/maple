import { GetStaticPaths, GetStaticProps } from "next"
import { useRouter } from "next/router"
import { z } from "zod"
import { createPage } from "../../components/page"
import EditProfile, {
  TabTitles
} from "../../components/EditProfilePage/EditProfilePage"
import { createGetStaticTranslationProps } from "components/translations"
import ProtectedPageWrapper from "components/auth/ProtectedPageWrapper"

const Query = z.object({
  docName: z.tuple([z.string()]).optional()
})

export default createPage({
  title: "Edit Profile",
  Page: () => {
    const tabTitle = Query.parse(useRouter().query).docName?.[0] || "about-you"
    return (
      <ProtectedPageWrapper>
        <EditProfile tabTitle={tabTitle as TabTitles} />
      </ProtectedPageWrapper>
    )
  }
})

export const getStaticPaths: GetStaticPaths = async ctx => {
  return {
    paths: [
      { params: { docName: ["about-you"] } },
      { params: { docName: ["testimonies"] } },
      { params: { docName: ["following"] } },
      { params: { docName: [] } }
    ],
    fallback: false
  }
}

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "editProfile",
  "footer",
  "testimony"
])
