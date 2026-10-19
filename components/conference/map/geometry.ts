import type { Branch } from "../../../functions/src/common"
import geometry from "./geometry.json"

/**
 * The district maps' geometry: a Massachusetts outline and one cell per seat,
 * 160 House and 40 Senate.
 *
 * Ported from the UX mockup (k-g-k/maple-conference, commit 85b6e14), which
 * drew the same two maps. The cells are Voronoi cells grown from one point per
 * seat and clipped to the coastline, not district boundaries: they say which
 * seats are in the room, not where a district's edges run. Swap the JSON for
 * real shapes keyed the same way and the components need no change.
 *
 * Cells are keyed by district id (`districtId` in functions/src/districts),
 * the same id the districts collection uses, so a member's seat is found
 * from their district with no lookup.
 */

type Geometry = {
  /** minX, minY, width, height of the drawing. */
  box: [number, number, number, number]
  /** The state as SVG path data: mainland and two islands. */
  outline: string[]
  /** District id to polygon points, "x,y x,y …". */
  house: Record<string, string>
  senate: Record<string, string>
}

const data = geometry as unknown as Geometry

export const box = data.box
export const outline = data.outline

export const cells: Record<Branch, Record<string, string>> = {
  House: data.house,
  Senate: data.senate
}

export const seatCount: Record<Branch, number> = {
  House: Object.keys(data.house).length,
  Senate: Object.keys(data.senate).length
}
