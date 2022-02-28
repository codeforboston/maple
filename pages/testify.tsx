import { createPage } from "../components/page"
import MyTestimonies from "../components/MyTestimonies/MyTestimonies"

export default createPage({
  v2: true,
  title: "Testify",
  Page: () => {
    return (
      <>
        <h1>Testify (TODO)</h1>
        <p>
          Eventually this will contain a form to submit testimony for a bill.
          There are two steps: selecting the bill and composing your testimony.
          If you navigate here from the nav bar, you will be prompted to select
          the bill using a search bar. Selecting the bill will update the page
          URL to `/testify?bill=$billId` and move on to the form. If you
          navigate here from a bill page (`/browse?bill=$billId`), the bill will
          be preselected.
        </p>
        <MyTestimonies/>
      </>
    )
  }
})
