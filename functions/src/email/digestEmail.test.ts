import * as fs from "fs"
import * as handlebars from "handlebars"
import * as path from "path"
import { NotificationEmailDigest } from "../notifications/emailTypes"
import { registerHelpers, registerPartials } from "./handlebarsHelpers"

const render = (digest: NotificationEmailDigest) => {
  registerHelpers()
  registerPartials(path.join(__dirname, "partials"))
  const source = fs.readFileSync(
    path.join(__dirname, "digestEmail.handlebars"),
    "utf8"
  )
  return handlebars.compile(source)(digest)
}

const empty: NotificationEmailDigest = {
  notificationFrequency: "Weekly",
  startDate: new Date("2025-02-22"),
  endDate: new Date("2025-03-01"),
  bills: [],
  numBillsWithNewTestimony: 0,
  users: [],
  numUsersWithNewTestimony: 0,
  ballotQuestions: [],
  numBallotQuestionsWithNewTestimony: 0,
  conferences: [],
  numConferencesWithNewTestimony: 0
}

describe("digest email, conferences", () => {
  it("links a followed conference and words its stances", () => {
    const html = render({
      ...empty,
      conferences: [
        {
          conferenceId: "phones",
          conferenceName: "Phone-Free Schools",
          court: "194",
          newTestimonyCount: 3,
          stances: [
            { stance: "Please pass something", count: 2 },
            { stance: "Don't pass anything", count: 1 }
          ]
        }
      ],
      numConferencesWithNewTestimony: 1
    })

    expect(html).toContain("Conference Committees")
    expect(html).toContain(
      "https://mapletestimony.org/conferences/194/phones#input"
    )
    expect(html).toContain("Phone-Free Schools")
    expect(html).toContain("New Testimonies")
    expect(html).toMatch(/2<\/td>\s*<td[^>]*>Please pass something/)
    expect(html).toContain("Don&#x27;t pass anything")
  })

  it("leaves the section out for a reader following no conference", () => {
    expect(render(empty)).not.toContain("Conference Committees")
  })

  it("points to the rest past four conferences", () => {
    const conference = {
      conferenceId: "c",
      conferenceName: "C",
      court: "194",
      newTestimonyCount: 1,
      stances: []
    }
    const html = render({
      ...empty,
      conferences: [conference, conference, conference, conference],
      numConferencesWithNewTestimony: 6
    })
    expect(html).toContain(
      "2 other conference committees you follow received testimony"
    )
  })
})
