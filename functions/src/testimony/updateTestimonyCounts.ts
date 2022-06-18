import { Bill } from "../bills/types"
import { DocUpdate } from "../common"
import { countsByPositions, Testimony } from "./types"

type FieldUpdate = Pick<
  DocUpdate<Bill>,
  "opposeCount" | "neutralCount" | "endorseCount" | "testimonyCount"
>

/** Updates bill fields that track testimony counts based on changes to the
 * user's testimony. */
export function updateTestimonyCounts(
  bill: Bill,
  currentPublication?: Testimony,
  newPublication?: Testimony
): FieldUpdate {
  const update: FieldUpdate = {}
  if (currentPublication) {
    const oldPosition = countsByPositions[currentPublication.position]
    update[oldPosition] = Math.max(bill[oldPosition] - 1, 0)
    update.testimonyCount = Math.max(bill.testimonyCount - 1, 0)
  }
  if (newPublication) {
    const newPosition = countsByPositions[newPublication.position]
    update[newPosition] = bill[newPosition] + 1
    update.testimonyCount = bill.testimonyCount + 1
  }
  return update
}
