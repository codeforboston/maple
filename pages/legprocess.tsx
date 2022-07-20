import { Container } from "../components/bootstrap"
import { createPage } from "../components/page"

export default createPage({
  title: "How To Have Impact Through Legislative Testimony",
  Page: () => {
    return (
      <Container className="mt-3">
        <h1 className="mt-4">Communicating with Legislators</h1>
        There are multiple ways for you to voice your opinion to your
        legislators, including:
        <ul>
          <li>
            Testify in writing! You can submit your thoughts on a bill to the
            Committee hearing it before the date of their public hearing. This
            website, the MAPLE platform, focuses on this mechanism.
          </li>
          <li>
            Testify orally. You can attend a public hearing for a bill of
            interest to you and sign up for a slot to speak before the
            Committee.
          </li>
          <li>
            Write to or call them. You can contact your legislators any time by{" "}
            <a href="https://malegislature.gov/search/findmylegislator">
              looking up their contact information on the MA Legislature website
            </a>
            . Your voice will probably carry the most weight with the House and
            Senate representatives of your own district, but you are free to
            contact Committee Chairs or any other member of the legislature with
            your opinions. You could request a meeting in person.
          </li>
        </ul>
      </Container>
    )
  }
})
