import { currentGeneralCourt } from "functions/src/shared"
import { listConferences } from "../db/conferences"
import { getMember, getMemberSearchIndex } from "../db/members"
import { loadConferenceIndex, loadConferencePage } from "./load"

jest.mock("../db/conferences")
jest.mock("../db/events", () => ({ getEventSummary: jest.fn() }))
jest.mock("../db/members")

const conference = (id: string, memberCodes: string[]) =>
  ({
    id,
    court: currentGeneralCourt,
    title: id,
    status: "active",
    hearingIds: [],
    conferees: memberCodes.map(memberCode => ({
      memberCode,
      branch: "Senate",
      chair: false
    }))
  } as any)

const facts = (MemberCode: string, Name: string) => ({
  MemberCode,
  Name,
  Party: "Democrat",
  District: "Third Essex",
  EmailAddress: ""
})

const index = (...members: ReturnType<typeof facts>[]) =>
  ({
    representatives: [],
    senators: members.map(m => ({ ...m, Branch: "Senate" }))
  } as any)

const names = (props: Awaited<ReturnType<typeof loadConferenceIndex>>) =>
  Object.fromEntries(
    Object.entries(props.conferees).map(([id, cs]) => [id, cs.map(c => c.name)])
  )

beforeEach(() => {
  jest.resetAllMocks()
  jest
    .mocked(listConferences)
    .mockResolvedValue([conference("a", ["X", "Y"]), conference("b", ["X"])])
})

describe("loadConferenceIndex", () => {
  it("resolves conferees from the search index without reading members", async () => {
    jest
      .mocked(getMemberSearchIndex)
      .mockResolvedValue(index(facts("X", "Xena"), facts("Y", "Yuri")))

    const props = await loadConferenceIndex(currentGeneralCourt)

    expect(names(props)).toEqual({ a: ["Xena", "Yuri"], b: ["Xena"] })
    expect(getMemberSearchIndex).toHaveBeenCalledTimes(1)
    expect(getMember).not.toHaveBeenCalled()
  })

  it("leaves out a conferee the index does not have", async () => {
    jest
      .mocked(getMemberSearchIndex)
      .mockResolvedValue(index(facts("X", "Xena")))

    expect(names(await loadConferenceIndex(currentGeneralCourt))).toEqual({
      a: ["Xena"],
      b: ["Xena"]
    })
  })

  it("reads members one by one, once each, where the index is missing", async () => {
    jest.mocked(getMemberSearchIndex).mockResolvedValue(undefined)
    jest
      .mocked(getMember)
      .mockImplementation(
        async (_court, code) =>
          (code === "X" ? facts("X", "Xena") : undefined) as any
      )

    expect(names(await loadConferenceIndex(currentGeneralCourt))).toEqual({
      a: ["Xena"],
      b: ["Xena"]
    })
    expect(getMember).toHaveBeenCalledTimes(2)
  })

  it("never uses the current court's index for another court", async () => {
    jest.mocked(getMember).mockResolvedValue(facts("X", "Xena") as any)

    await loadConferenceIndex(currentGeneralCourt - 1)

    expect(getMemberSearchIndex).not.toHaveBeenCalled()
    expect(getMember).toHaveBeenCalled()
  })
})

describe("loadConferencePage", () => {
  it("still reads its members one by one", async () => {
    jest.mocked(getMember).mockResolvedValue(facts("X", "Xena") as any)

    const page = await loadConferencePage(currentGeneralCourt, "b")

    expect(page?.conferees.map(c => c.name)).toEqual(["Xena"])
    expect(getMemberSearchIndex).not.toHaveBeenCalled()
  })
})
