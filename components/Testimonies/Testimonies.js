import TestimoniesTable from "../TestimoniesTable/TestimoniesTable"
import { usePublishedTestimonyListing } from "../db"

// the word "testimonies": In more general, commonly used, contexts, the plural form will also be testimony.  However, in more specific contexts, the plural form can also be testimonies e.g. in reference to various types of testimonies or a collection of testimonies.

const Testimonies = () => {
  const testimoniesResponse = usePublishedTestimonyListing({})
  const testimonies =
    testimoniesResponse.status == "success" ? testimoniesResponse.result : []

  return <TestimoniesTable testimonies={testimonies} />
}

export default Testimonies
