import { countsByPositions, Testimony } from "./types"

type CountField =
  | "testimonyCount"
  | (typeof countsByPositions)[keyof typeof countsByPositions]

/** Updates the given testimony-count fields based on changes to the user's
 * testimony. Missing counts start at zero. Throws on a position whose count
 * field is not among `fields`: draft validation keeps those out, so one here
 * is a broken invariant. */
export function updateTestimonyCounts<F extends CountField>(
  fields: readonly F[],
  counts: Partial<Record<F, number>>,
  currentPublication?: Pick<Testimony, "position">,
  newPublication?: Pick<Testimony, "position">
): Record<F, number> {
  const update = Object.fromEntries(
    fields.map(field => [field, counts[field] ?? 0])
  ) as Record<string, number>
  const adjust = (position: Testimony["position"], delta: number) => {
    const field = countsByPositions[position]
    if (!(field in update))
      throw new Error(`No count field for position ${position} on this target`)
    for (const f of [field, "testimonyCount"])
      update[f] = Math.max(update[f] + delta, 0)
  }
  if (currentPublication) adjust(currentPublication.position, -1)
  if (newPublication) adjust(newPublication.position, 1)
  return update as Record<F, number>
}
