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
    const slug = Query.parse(useRouter().query).docName?.[0] || "privacy"
    // The privacy policy lives at /policies/privacy; its text and labels keep
    // the "privacy-policy" name (public/privacy-policy.md).
    const policy = slug === "privacy" ? "privacy-policy" : slug
    return <PolicyPage policy={policy as Policy} />
  }
})

export const getStaticPaths: GetStaticPaths = async ctx => {
  return {
    paths: [
      { params: { docName: ["privacy"] } },
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
  "learn",
  "policies",
  "testimony"
])
