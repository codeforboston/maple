import type { TFunction } from "next-i18next"
import { lobbyingErrorMessage } from "./errorMessage"

const t = ((key: string) => key) as unknown as TFunction

describe("lobbyingErrorMessage", () => {
  it("rewords Firestore's offline error", () => {
    const offline = Object.assign(
      new Error("Failed to get document because the client is offline."),
      { code: "unavailable" }
    )
    expect(lobbyingErrorMessage(offline, t)).toBe("errors.unavailable")
  })

  it("passes other errors through", () => {
    expect(lobbyingErrorMessage(new Error("Bad request"), t)).toBe(
      "Bad request"
    )
    expect(lobbyingErrorMessage(undefined, t)).toBe("")
  })
})
