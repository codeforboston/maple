import { usePublishedTestimonyListing2 } from "../db"
import TestimoniesTable from "../TestimoniesTable/TestimoniesTable"

// the word "testimonies": In more general, commonly used, contexts, the plural form will also be testimony.  However, in more specific contexts, the plural form can also be testimonies e.g. in reference to various types of testimonies or a collection of testimonies.

const BillTestimonies = props => {
  const bill = props.bill
  const { items } = usePublishedTestimonyListing2({
    billId: bill.BillNumber
  })
  console.log(items)
  const testimonies = items.status == "success" ? items.result : []

  return <TestimoniesTable testimonies={testimonies} />
}

export default BillTestimonies
