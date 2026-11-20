import { act, renderHook } from "@testing-library/react"
import {
  recordVerificationEmailSent,
  useRecentVerificationEmail,
  VERIFICATION_EMAIL_COOLDOWN_MS,
  verificationEmailWaitMs
} from "./verificationEmailCooldown"

afterEach(() => {
  jest.restoreAllMocks()
  jest.useRealTimers()
  localStorage.clear()
})

describe("verificationEmailWaitMs", () => {
  it("is 0 when no email has been sent", () => {
    expect(verificationEmailWaitMs("never-sent")).toBe(0)
  })

  it("counts down a minute from the last send", () => {
    const sentAt = 1_000_000
    recordVerificationEmailSent("counting", sentAt)
    expect(verificationEmailWaitMs("counting", sentAt)).toBe(
      VERIFICATION_EMAIL_COOLDOWN_MS
    )
    expect(verificationEmailWaitMs("counting", sentAt + 20_000)).toBe(40_000)
    expect(
      verificationEmailWaitMs(
        "counting",
        sentAt + VERIFICATION_EMAIL_COOLDOWN_MS
      )
    ).toBe(0)
  })

  it("keeps each account's wait separate", () => {
    recordVerificationEmailSent("one", 5_000)
    expect(verificationEmailWaitMs("two", 5_000)).toBe(0)
  })

  it("survives a reload through localStorage", () => {
    localStorage.setItem("verificationEmailSentAt:reloaded", "7000")
    expect(verificationEmailWaitMs("reloaded", 8_000)).toBe(59_000)
  })

  it("still waits when storage is unavailable", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage disabled")
    })
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled")
    })
    recordVerificationEmailSent("no-storage", 10_000)
    expect(verificationEmailWaitMs("no-storage", 10_000)).toBe(
      VERIFICATION_EMAIL_COOLDOWN_MS
    )
  })

  it("never waits longer than a minute, even if the clock moved back", () => {
    recordVerificationEmailSent("clock", 500_000)
    expect(verificationEmailWaitMs("clock", 100_000)).toBe(
      VERIFICATION_EMAIL_COOLDOWN_MS
    )
  })
})

describe("useRecentVerificationEmail", () => {
  it("is true right after a send and turns false after a minute", () => {
    jest.useFakeTimers()
    const { result, rerender } = renderHook(() =>
      useRecentVerificationEmail("hook")
    )
    expect(result.current).toBe(false)

    recordVerificationEmailSent("hook")
    rerender()
    expect(result.current).toBe(true)

    act(() => {
      jest.advanceTimersByTime(VERIFICATION_EMAIL_COOLDOWN_MS)
    })
    expect(result.current).toBe(false)
  })
})
