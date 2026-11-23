import { signupProfile } from "./signupProfile"

describe("signupProfile", () => {
  it("leaves out the fields a Google sign-up doesn't send", () => {
    // Writing these as undefined made Firestore refuse the new profile.
    expect(signupProfile("user", { requestedRole: "user" })).toEqual({})
  })

  it("keeps the fields an email sign-up sends", () => {
    const data = {
      requestedRole: "user",
      fullName: "Jamie Example",
      notificationFrequency: "Weekly",
      email: "jamie@example.com",
      public: true
    }
    expect(signupProfile("user", data)).toEqual({
      fullName: "Jamie Example",
      notificationFrequency: "Weekly",
      email: "jamie@example.com",
      public: true
    })
  })

  it("keeps a false public setting", () => {
    expect(signupProfile("user", { public: false })).toEqual({ public: false })
  })

  it("takes an organization's fields for an organization", () => {
    const data = {
      requestedRole: "organization",
      fullName: "Example Coalition",
      email: "info@example.org",
      orgCategories: ["Education"],
      notificationFrequency: "Weekly"
    }
    expect(signupProfile("organization", data)).toEqual({
      fullName: "Example Coalition",
      email: "info@example.org",
      orgCategories: ["Education"]
    })
  })
})
