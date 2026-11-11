import { resolveRecipients } from "./recipients"

describe("resolveRecipients", () => {
  const env = { ...process.env }
  afterEach(() => {
    process.env = { ...env }
  })

  it("sends to the real addresses in production", () => {
    process.env.GCLOUD_PROJECT = "digital-testimony-prod"
    expect(resolveRecipients(["a@x.org", "b@x.org"])).toEqual({
      to: ["a@x.org", "b@x.org"],
      subjectPrefix: ""
    })
  })

  it("swaps in the test address elsewhere and names who it would have reached", () => {
    process.env.GCLOUD_PROJECT = "digital-testimony-dev"
    process.env.LETTER_TEST_RECIPIENT = "test@x.org"
    expect(resolveRecipients(["a@x.org", "b@x.org"])).toEqual({
      to: ["test@x.org"],
      subjectPrefix: "[dev] would have gone to: a@x.org, b@x.org — "
    })
  })

  it("sends nothing elsewhere when no test address is set", () => {
    process.env.GCLOUD_PROJECT = "demo-dtp"
    delete process.env.LETTER_TEST_RECIPIENT
    expect(resolveRecipients(["a@x.org"]).to).toEqual([])
  })
})
