import { Button, Stack } from "react-bootstrap"
import PolicyPage, { Policy } from "components/Policies/PolicyPage"
import { z } from "zod"
import { GetStaticPaths, GetStaticProps } from "next"
import { useRouter } from "next/router"
import { createPage } from "components/page"

const Query = z.object({
  docName: z.tuple([z.string()]).optional()
})

export default createPage({
  title: "Terms of Use",
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

// this must only be on pages in the pages folder
// it will throw an error if it's in the components folder
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "footer"]))
      // Will be passed to the page component as props
    }
  }
}
