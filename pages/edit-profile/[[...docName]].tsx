import { GetStaticPaths, GetStaticProps } from "next"
import { useRouter } from "next/router"
import { z } from "zod"
import { requireAuth } from "../../components/auth"
import { createPage } from "../../components/page"
import EditProfile, {
  TabTitles
} from "../../components/EditProfilePage/EditProfilePage"
import { createGetStaticTranslationProps } from "components/translations"

const Query = z.object({
  docName: z.tuple([z.string()]).optional()
})

export default createPage({
  titleI18nKey: "navigation.editProfile",
  Page: () => {
    // Page: requireAuth(({ user }) => {
    const tabTitle = Query.parse(useRouter().query).docName?.[0] || "about-you"
    return <EditProfile tabTitle={tabTitle as TabTitles} />
  }
})

export const getStaticPaths: GetStaticPaths = async ctx => {
  return {
    paths: [
      { params: { docName: ["about-you"] } },
      { params: { docName: ["testimonies"] } },
      { params: { docName: ["following"] } },
      { params: { docName: ["followers"] } },
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
