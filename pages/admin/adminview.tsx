import { requireAuth } from "../../components/auth"
import { createPage } from "../../components/page"
import AdminDashboard  from "../../components/Admin/AdminDashboard"

export default createPage({
  title: "Admin View",
  Page: requireAuth(({ user }) => {
    return <AdminDashboard />
  })
})
