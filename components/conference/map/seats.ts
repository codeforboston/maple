import seats from "./seats.json"
import type { Branch } from "../../../functions/src/common"

/**
 * Which cell is whose. A seat is found from a member document's Branch and
 * District, which the legislature spells the same way the map does ("14th
 * Norfolk", "Third Essex"). Used when the page is built, not in the browser:
 * only the six conferees ever need resolving, and they pass through the
 * server.
 */
const data = seats as Record<string, { branch: Branch; district: string }>

const byDistrict = new Map(
  Object.entries(data).map(([key, s]) => [`${s.branch}:${s.district}`, key])
)

/** The seat key for a member, or undefined where the map has no such seat. */
export const seatKey = (branch: string, district: string) =>
  byDistrict.get(`${branch}:${district}`)
