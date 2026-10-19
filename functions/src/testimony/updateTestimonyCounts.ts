import { countsByPositions, Testimony } from "./types"

type CountField =
  | "testimonyCount"
  | (typeof countsByPositions)[keyof typeof countsByPositions]

/** Updates the given testimony-count fields based on changes to the user's
 * testimony. A position whose count field is not among `fields` moves only
 * `testimonyCount`. */
export function updateTestimonyCounts<F extends CountField>(
  fields: readonly F[],
  counts: Record<F, number>,
  currentPublication?: Pick<Testimony, "position">,
  newPublication?: Pick<Testimony, "position">
): Record<F, number> {
  const update = Object.fromEntries(
    fields.map(field => [field, counts[field]])
  ) as Record<string, number>
  const adjust = (field: string, delta: number) => {
    if (field in update) update[field] = Math.max(update[field] + delta, 0)
  }
  if (currentPublication) {
    adjust(countsByPositions[currentPublication.position], -1)
    adjust("testimonyCount", -1)
  }
  if (newPublication) {
    adjust(countsByPositions[newPublication.position], 1)
    adjust("testimonyCount", 1)
  }
  return update as Record<F, number>
}
