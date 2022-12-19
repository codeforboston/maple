import { createMeta } from "stories/utils"
import { ComponentStory } from "@storybook/react"
import { BillTestimonies } from "../../components/bill/BillTestimonies"
import { type } from "os"
import { MemberReference } from "functions/src/members/types"

// TODO: move into components directory
const BillTestimonyListCard = BillTestimonies

export default createMeta({
  title: "Bill Detail/BillTestimonyListCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=180%3A7916",
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
