import { requireAuth } from "../../components/auth"
import { createPage } from "../../components/page"
import AdminPage from "../../components/AdminPage/AdminPage"


export default createPage({
  title: "Admin View",
  Page: requireAuth(({ user }) => {
    return <AdminPage />
  })
})
