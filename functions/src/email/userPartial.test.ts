import * as handlebars from "handlebars"
import * as path from "path"
import { registerHelpers, registerPartials } from "./handlebarsHelpers"

const render = (bills: object[]) => {
  registerHelpers()
  registerPartials(path.join(__dirname, "partials"))
  return handlebars.compile("{{> user}}")({
    userId: "author1",
    userName: "Alice",
    newTestimonyCount: bills.length,
    bills
  })
}

describe("user digest partial", () => {
  it("links conference testimony to its conference and words the stance", () => {
    const html = render([
      {
        billId: "S2581",
        court: "194",
        conferenceId: "student-learning-and-mental-health",
        stance: "Pass the Senate version"
      }
    ])

    expect(html).toContain(
      'href="https://mapletestimony.org/conferences/194/student-learning-and-mental-health"'
    )
    expect(html).toContain("Pass the Senate version")
    expect(html).not.toContain("/bills/194/S2581")
    expect(html).not.toContain("images_no-svgs")
  })

  it("keeps a bill testimony's link and position image", () => {
    const html = render([
      { billId: "H1234", court: "194", position: "endorse" }
    ])

    expect(html).toContain('href="https://mapletestimony.org/bills/194/H1234"')
    expect(html).toContain(
      'src="https://mapletestimony.org/email/images_no-svgs/endorse.jpg"'
    )
  })

  it("handles conference testimony in the sixth slot", () => {
    const bill = { billId: "H1", court: "194", position: "oppose" }
    const html = render([
      bill,
      bill,
      bill,
      bill,
      bill,
      {
        billId: "S2581",
        court: "194",
        conferenceId: "student-learning-and-mental-health",
        stance: "Pass the Senate version"
      }
    ])

    expect(html).toContain(
      "/conferences/194/student-learning-and-mental-health"
    )
  })
})
