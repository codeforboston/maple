import { Container } from "react-bootstrap"
import { TestimonyCardList } from "components/LearnTestimonyComponents/TestimonyCardComponents"

const LegislativeContent = [
  {
    title: "Filing",
    paragraphs: [
      `A Representative, Senator, or the Governor must file a bill. Constituents can write to their legislators (typically their own  district's House or Senate member) to propose a bill to be filed. This can be done at any time, but is typically done before the start of the legislative session (i.e. before the third Friday in January of odd-numbered years). Bills filed later, during the legislative session, require special approval.`
    ],
    src: "speaker-podium.svg",
    alt: ""
  },
  {
    title: "Testimony",
    paragraphs: [
      `All stakeholders have the chance to share their thoughts with the legislature by submitting written testimony. Typically, testimony is submitted to the legislative Committee responsible for the bill in advance of their public hearing. You can also deliver oral testimony by attending a hearing or you can reach out to your legislators and speak to them directly.`
    ],
    src: "mic-with-testify.svg",
    alt: ""
  },
  {
    title: "Public hearing",
    paragraphs: [
      `All bills are formally heard by committees during public hearings which are open to the public and recorded and posted as videos on the legislature's website. While the amount of time available to speak during a public hearing is limited, more detailed comments can be submitted to the committee in written testimony.`
    ],
    src: "doc-with-arrows-to-people.svg",
    alt: ""
  },
  {
    title: "Committee reports",
    paragraphs: [
      `Committee reports. Committees must file reports on each bill under their consideration after discussing them in Executive Session following the public hearing. This typically occurs before February of the second year of the legislative session (even-numbered years). The goal for proponents of a bill is that the Committee will recommend they "ought to pass" and thereby promote them out of the Committee. Most bills, however are "sent to study," meaning that they will not be passed out of committee in that session. A successful bill may be redrafted or amended by the committee based on testimony received and other deliberations. Many of those bills will be refiled in the next session and can be considered again.`
    ],
    src: "leg-with-lightbulb.svg",
    alt: ""
  },
  {
    title: "Three readings",
    paragraphs: [
      `Each bill passed out of Committee will be "read" three times by each branch, the House and Senate. This typically entails floor debate of the full chamber and a vote of the Committee on Ways and Means or Steering and Policy.`
    ],
    src: "speaker-with-leg.svg",
    alt: ""
  },
  {
    title: "Engrossment and Enactment",
    paragraphs: [
      `After the three readings, the bill will be voted on by each of the full chambers (House and Senate), resulting in (if successful) "engrossment" and then "enactment.`
    ],
    src: "opinions.svg",
    alt: ""
  },
  {
    title: "Conference Committee",
    paragraphs: [
      `If necessary, differences between the House and Senate versions of a bill will be reconciled by a temporary Conference Committee appointed by the House Speaker and Senate President.`
    ],
    src: "respect-with-blob.svg",
    alt: ""
  },
  {
    title: "Executive branch",
    paragraphs: [
      `Lastly, the Governor is responsible for signing the enacted and reconciled bill into law. The governor can also veto the bill, return it to the Legislature for changes, or take a number of other less-common actions.`
    ],
    src: "speaker-with-pen.svg",
    alt: ""
  }
]

const Legislative = () => {
  return (
    <Container fluid="md" className="mt-3">
      <h1 className="fw-bold tracking-tighter lh-base">
        Understanding the Massachusetts Legislative Process
      </h1>
      <p className="fs-4 tracking-tight lh-base">
        Some of the key steps in the legislative process for how most bills
        become laws in MA.
      </p>
      <TestimonyCardList
        contents={LegislativeContent}
        shouldAlternateImages={false}
      />
    </Container>
  )
}

export default Legislative
