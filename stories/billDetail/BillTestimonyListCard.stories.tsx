import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { BillTestimonies } from "../../components/bill/BillTestimonies"

// TODO: move into components directory
const BillTestimonyListCard = BillTestimonies

export default createMeta({
  title: "Bill Detail/BillTestimonyListCard",
  figmaUrl:
    "https://www.figma.com/file/oMNmgiqDGTMco2v54gOW3b/MAPLE-Soft-Launch-(Mar-2023)?node-id=4009%3A15950&t=3gd7s59zbYBA1CZP-4",
  component: BillTestimonyListCard
})

var first = { Id: "test", Name: "tes", Type: 0 }

const Template: ComponentStory<typeof BillTestimonyListCard> = props => {
  return <BillTestimonyListCard {...props} />
}

export const Primary = Template.bind({})
Primary.args = {
  bill: {
    Title: "An Act fostering voting opportunities, trust, equity, and security",
    BillNumber: "H805",
    DocketNumber: "string",
    GeneralCourtNumber: 999,
    PrimarySponsor: first,
    Cosponsors: [first],
    LegislationTypeName: "string",
    Pinslip: "string",
    DocumentText: "string"
  },
  className: "janet"
}
