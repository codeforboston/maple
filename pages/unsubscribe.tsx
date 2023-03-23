import { requireAuth } from "../components/auth"
import { createPage } from "../components/page"
import { UnsubscribeConfirm } from "../components/Email/unsubscribe"

export default createPage({
  title: "Unsubscribe",
  Page: requireAuth(({ user }) => {
    return <UnsubscribeConfirm />
  })
})
