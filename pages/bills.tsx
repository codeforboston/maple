import { createPage } from "../components/page"
import ViewBills from "../components/ViewBills/ViewBills"

export default createPage({
  v2: true,
  title: "Browse Bills",
  Page: () => {
    return (
      <>
        <h1>Bills</h1>

        <ViewBills />
      </>
    )
  }
})
