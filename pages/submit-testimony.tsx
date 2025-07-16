import { createPage } from "../components/page"
import {
  usePublishService,
  useSyncRouterAndStore
} from "../components/publish/hooks"
import { SubmitTestimonyForm } from "../components/publish/SubmitTestimonyForm"
import { createGetStaticTranslationProps } from "components/translations"
import ProtectedPageWrapper from "components/auth/ProtectedPageWrapper"

export default createPage({
  title: "Submit Testimony",
  Page: () => {
    useSyncRouterAndStore()

    return (
      <ProtectedPageWrapper>
        <usePublishService.Provider />
        <SubmitTestimonyForm />
      </ProtectedPageWrapper>
    )
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "testimony",
  "editProfile"
])
