import { usePublishedTestimonyListing } from "../db"
import ViewTestimony from "../TestimonyCard/ViewTestimony"
import { BillProps } from "./types"

export const BillTestimonies = (
  props: BillProps & {
    className?: string
  }
) => {
  const { id, court } = props.bill
  const testimony = usePublishedTestimonyListing({
    billId: id,
    court
  })

  return (
    <div id="testimonies">
      <ViewTestimony
        {...testimony}
        className={props.className}
        onProfilePage={false}
      />
    </div>
  )
}
