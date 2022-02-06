import { createPage } from "../components/page"

export default createPage({
  v2: true,
  title: "Browse",
  Page: () => {
    return (
      <>
        <h1>Browse (TODO)</h1>
        <p>
          Eventually this will contain a list of bills and a search bar.
          Clicking on a bill will navigate to `/browse?bill=$billId` and show
          the testimony submitted for the bill. From there, you can peruse the
          testimony. You can also click a "share your voice" button, which will
          navigate to the form to submit testimony at `/testify?bill=$billId`.
        </p>
      </>
    )
  }
})
