import { usePublishedTestimonyListing } from "../components/db"
import { createPage } from "../components/page"
import TestimoniesTable from "../components/TestimoniesTable/TestimoniesTable"

export default createPage({
  v2: true,
  title: "Browse Testimony",
  Page: () => {
    const testimony = usePublishedTestimonyListing()
    return (
      <>
        <h1>Published Testimony</h1>
        <TestimoniesTable {...testimony} search />
      </>
    )
  }
})
