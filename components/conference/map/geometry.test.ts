import { districtId } from "functions/src/districts/normalize"
import { cells, seatCount } from "./geometry"

describe("district map cells", () => {
  it("has a cell for every seat in both chambers", () => {
    expect(seatCount.House).toBe(160)
    expect(seatCount.Senate).toBe(40)
  })

  it("keys each cell by its district id, in its own chamber", () => {
    const all = [...Object.keys(cells.House), ...Object.keys(cells.Senate)]
    expect(new Set(all).size).toBe(200)
    for (const chamber of ["House", "Senate"] as const) {
      for (const key of Object.keys(cells[chamber])) {
        expect(key.startsWith(`${chamber.toLowerCase()}-`)).toBe(true)
        // Already normalized: feeding the id's district part back in is stable.
        expect(districtId(chamber, key.slice(chamber.length + 1))).toBe(key)
      }
    }
  })

  it("finds conferees from the legislature's own district strings", () => {
    // As the public members API returns them for the 194th court.
    expect(cells.House[districtId("House", "14th Norfolk")]).toBeDefined()
    expect(cells.House[districtId("House", "3rd Barnstable")]).toBeDefined()
    expect(cells.Senate[districtId("Senate", "Third Essex")]).toBeDefined()
    expect(
      cells.Senate[districtId("Senate", "First Bristol and Plymouth")]
    ).toBeDefined()
    expect(cells.Senate[districtId("Senate", "Nowhere")]).toBeUndefined()
  })
})
