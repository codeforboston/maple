import { conferenceInputEvent } from "./inputEvents"

const pub = (over: Record<string, unknown> = {}) =>
  ({
    conferenceId: "c1",
    court: 194,
    authorUid: "u1",
    authorRole: "user",
    position: "passSenateVersion",
    version: 1,
    ...over
  } as Parameters<typeof conferenceInputEvent>[0])

const state = (position = "passSenateVersion", version = 1) => ({
  position,
  group: "individual",
  version
})

describe("conferenceInputEvent", () => {
  it("records conference input being added", () => {
    expect(conferenceInputEvent(undefined, pub(), "t1")).toEqual({
      court: 194,
      conferenceId: "c1",
      testimonyId: "t1",
      authorUid: "u1",
      change: "added",
      after: state()
    })
  })

  it("records an edit with both sides", () => {
    expect(
      conferenceInputEvent(
        pub(),
        pub({ version: 2, position: "passNothing" }),
        "t1"
      )
    ).toMatchObject({
      change: "edited",
      before: state(),
      after: state("passNothing", 2)
    })
  })

  it("records a deletion as a withdrawal", () => {
    expect(conferenceInputEvent(pub(), undefined, "t1")).toMatchObject({
      change: "withdrawn",
      before: state()
    })
  })

  it("ignores a write that keeps the version, such as a cosign tally", () => {
    expect(
      conferenceInputEvent(pub(), pub({ cosignCount: 3 }), "t1")
    ).toBeUndefined()
  })

  it("ignores testimony that is not conference input", () => {
    const bill = pub({ conferenceId: undefined, position: "endorse" })
    expect(conferenceInputEvent(undefined, bill, "t1")).toBeUndefined()
    expect(conferenceInputEvent(bill, undefined, "t1")).toBeUndefined()
  })

  it("groups authors as the site does", () => {
    const group = (authorRole: string) =>
      conferenceInputEvent(undefined, pub({ authorRole }), "t1")?.after?.group
    expect(group("organization")).toBe("organization")
    expect(group("legislator")).toBe("government")
    expect(group("user")).toBe("individual")
    expect(group("admin")).toBe("individual")
  })
})
