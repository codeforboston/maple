import { requireAuth } from "../components/auth"
import { createPage } from "../components/page"
import {
  usePublishService,
  useSyncRouterAndStore
} from "../components/publish/hooks"
import { SubmitTestimonyForm } from "../components/publish/SubmitTestimonyForm"

export default createPage({
  title: "Submit Testimony",
  Page: requireAuth(() => {
    useSyncRouterAndStore()

    return (
      <>
        <usePublishService.Provider />
        <SubmitTestimonyForm />
      </>
    )
  })
})

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
