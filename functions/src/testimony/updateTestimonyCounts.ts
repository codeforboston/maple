import { Bill } from "../bills/types"
import { countsByPositions, Testimony } from "../../../common/testimony/types"

type FieldUpdate = Pick<
  Bill,
  "opposeCount" | "neutralCount" | "endorseCount" | "testimonyCount"
>

/** Updates bill fields that track testimony counts based on changes to the
 * user's testimony. */
export function updateTestimonyCounts(
  { testimonyCount, endorseCount, neutralCount, opposeCount }: Bill,
  currentPublication?: Testimony,
  newPublication?: Testimony
): FieldUpdate {
  const update: FieldUpdate = {
    testimonyCount,
    endorseCount,
    neutralCount,
    opposeCount
  }
  if (currentPublication) {
    const oldPosition = countsByPositions[currentPublication.position]
    update[oldPosition] = Math.max(update[oldPosition] - 1, 0)
    update.testimonyCount = Math.max(update.testimonyCount - 1, 0)
  }
  if (newPublication) {
    const newPosition = countsByPositions[newPublication.position]
    update[newPosition] += 1
    update.testimonyCount += 1
  }
  return update
}
