import { Container } from "../components/bootstrap"
import { usePublishedTestimonyListing } from "../components/db"
import { createPage } from "../components/page"
import TestimoniesTable from "../components/TestimoniesTable/TestimoniesTable"

export default createPage({
  title: "Browse Testimony",
  Page: () => {
    const testimony = usePublishedTestimonyListing()
    return (
      <Container className="mt-3">
        <h1>Published Testimony</h1>
        <TestimoniesTable {...testimony} search />
      </Container>
    )
  }
})
