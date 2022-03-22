import { createPage } from "../components/page"
import ViewBills from "../components/ViewBills/ViewBills"

export default createPage({
  v2: true,
  title: "Browse",
  Page: () => {
    return (
      <>
        <h1>Browse</h1>

        <ViewBills />
      </>
    )
  }
})
