import { getNextDigestAt, getNotificationStartDate } from "./helpers"
import { Timestamp } from "../../../common/types"
import { Frequency } from "../../../common/auth/types"

describe("getNextDigestAt", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("should return the next Tuesday for weekly frequency", () => {
    // Set a fixed date: Monday, March 3, 2025
    const fixedDate = new Date(2025, 2, 3)

    // Next Tuesday, March 4, 2025
    const expectedDate = new Date(2025, 2, 4)

    jest.setSystemTime(fixedDate)

    const result = getNextDigestAt("Weekly")
    expect(result).toEqual(Timestamp.fromDate(expectedDate))
  })

  // Extra test covering this case because getting this
  // wrong could cause an expensive infinite function loop
  it("should return the next Tuesday for weekly frequency when the current day is Tuesday", () => {
    // Set a fixed date: Tuesday, March 4, 2025
    const fixedDate = new Date(2025, 2, 4)

    // Next Tuesday, March 11, 2025
    const expectedDate = new Date(2025, 2, 11)

    jest.setSystemTime(fixedDate)

    const result = getNextDigestAt("Weekly")
    expect(result).toEqual(Timestamp.fromDate(expectedDate))
  })

  it("should return the next 1st of the month for monthly frequency", () => {
    // Set a fixed date: March 15, 2025
    const fixedDate = new Date(2025, 2, 15)
    // Next 1st of the month, April 1, 2025
    const expectedDate = new Date(2025, 3, 1)

    jest.setSystemTime(fixedDate)

    const result = getNextDigestAt("Monthly")
    expect(result).toEqual(Timestamp.fromDate(expectedDate))
  })

  // Extra test covering this case because getting this
  // wrong could cause an expensive infinite function loop
  it("should return the next 1st of the month for monthly frequency when it is the 1st of the month", () => {
    // Set a fixed date: March 1, 2025
    const fixedDate = new Date(2025, 2, 1)
    // Next 1st of the month, April 1, 2025
    const expectedDate = new Date(2025, 3, 1)

    jest.setSystemTime(fixedDate)

    const result = getNextDigestAt("Monthly")
    expect(result).toEqual(Timestamp.fromDate(expectedDate))
  })

  it("should return null for none frequency", () => {
    const result = getNextDigestAt("None")
    expect(result).toBeNull()
  })

  it("should log an error and return null for unknown frequency", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation()
    const result = getNextDigestAt("SomeNewFrequency" as Frequency)
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      "Unknown notification frequency: SomeNewFrequency"
    )
    consoleSpy.mockRestore()
  })
})

describe("getNotificationStartDate", () => {
  it("should return the previous Tuesday for weekly frequency", () => {
    const fixedDate = Timestamp.fromDate(new Date(2025, 2, 11))
    const expectedDate = Timestamp.fromDate(new Date(2025, 2, 4))

    const result = getNotificationStartDate("Weekly", fixedDate)
    expect(result).toEqual(expectedDate)
  })

  it("should return the previous 1st of the month for monthly frequency", () => {
    const fixedDate = Timestamp.fromDate(new Date(2025, 2, 1))
    const expectedDate = Timestamp.fromDate(new Date(2025, 1, 1))

    const result = getNotificationStartDate("Monthly", fixedDate)
    expect(result).toEqual(expectedDate)
  })
})
