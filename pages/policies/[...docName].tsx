import { Button, Stack } from "react-bootstrap"
import PolicyPage, { Policy } from "components/Policies/PolicyPage"
import { z } from "zod"
import { GetStaticPaths, GetStaticProps } from "next"
import { useRouter } from "next/router"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"

const Query = z.object({
  docName: z.tuple([z.string()]).optional()
})

export default createPage({
  titleI18nKey: "titles.policies",
  Page: () => {
    const policy =
      Query.parse(useRouter().query).docName?.[0] || "privacy-policy"
    return <PolicyPage policy={policy as Policy} />
  }
})

export const getStaticPaths: GetStaticPaths = async ctx => {
  return {
    paths: [
      { params: { docName: ["privacy-policy"] } },
      { params: { docName: ["code-of-conduct"] } },
      { params: { docName: ["copyright"] } }
    ],
    fallback: false
  }
}

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "testimony"
])
