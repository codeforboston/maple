import { subDays } from "date-fns"
import { withinCutoff } from "./helpers"

describe("withinCutoff", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("should return true for a date within three days", () => {
    const now = new Date()

    const threeDaysAgo = subDays(now, 3)

    const result = withinCutoff(threeDaysAgo)
    expect(result).toEqual(true)
  })
})
