import { requireAuth } from "../components/auth"
import { createPage } from "../components/page"
import { useSyncRouterAndStore } from "../components/publish/navigation"
import { PublishService } from "../components/publish/PublishService"
import { SubmitTestimonyForm } from "../components/publish/SubmitTestimonyForm"

export default createPage({
  title: "Submit Testimony",
  Page: requireAuth(() => {
    useSyncRouterAndStore()

    return (
      <>
        <PublishService />
        <SubmitTestimonyForm />
      </>
    )
  })
})
