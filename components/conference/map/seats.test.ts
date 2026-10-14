import { cells, seatCount } from "./geometry"
import { seatKey } from "./seats"
import seats from "./seats.json"

describe("district map seats", () => {
  it("resolves conferees from the legislature's own district strings", () => {
    // As the public members API returns them for the 194th court.
    expect(seatKey("House", "14th Norfolk")).toBe("Norfolk-14")
    expect(seatKey("House", "3rd Barnstable")).toBe("Barnstable-3")
    expect(seatKey("Senate", "Third Essex")).toBeDefined()
    expect(seatKey("Senate", "First Bristol and Plymouth")).toBeDefined()
    expect(seatKey("Senate", "Nowhere")).toBeUndefined()
  })

  it("has a cell and a district for every seat in both chambers", () => {
    expect(seatCount.House).toBe(160)
    expect(seatCount.Senate).toBe(40)
    const table = seats as Record<string, { branch: string; district: string }>
    for (const chamber of ["House", "Senate"] as const) {
      for (const key of Object.keys(cells[chamber])) {
        const seat = table[key]
        expect(seat?.branch).toBe(chamber)
        expect(seatKey(chamber, seat.district)).toBe(key)
      }
    }
  })
})
