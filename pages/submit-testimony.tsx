import { requireAuth } from "../components/auth"
import { createPage } from "../components/page"
import {
  usePublishService,
  useSyncRouterAndStore
} from "../components/publish/hooks"
import { SubmitTestimonyForm } from "../components/publish/SubmitTestimonyForm"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  titleI18nKey: "titles.submit_testimony",
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

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "attachment",
  "common",
  "footer",
  "testimony",
  "editProfile"
])
