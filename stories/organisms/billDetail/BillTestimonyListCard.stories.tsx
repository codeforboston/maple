import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { BillTestimonies } from "components/bill/BillTestimonies"
import { Timestamp } from "firebase/firestore"
import { Provider as Redux } from "react-redux"
import { Providers } from "components/providers"
import { wrapper } from "components/store"

// TODO: move into components directory
const BillTestimonyListCard = BillTestimonies

export default createMeta({
  title: "Organisms/Bill Detail/BillTestimonyListCard",
  figmaUrl:
    "https://www.figma.com/file/oMNmgiqDGTMco2v54gOW3b/MAPLE-Soft-Launch-(Mar-2023)?node-id=4009%3A15950&t=3gd7s59zbYBA1CZP-4",
  component: BillTestimonyListCard
})

var first = { Id: "test", Name: "tes", Type: 0 }

const Template: ComponentStory<typeof BillTestimonyListCard> = props => {
  return <BillTestimonyListCard {...props} />
}

export const Primary = Template.bind({})

Primary.storyName = "BillTestimonyListCard"
Primary.decorators = [
  (Story, ...rest) => {
    const { store, props } = wrapper.useWrappedStore(...rest)

    return (
      <Redux store={store}>
        <Providers>
          <Story />
        </Providers>
      </Redux>
    )
  }
]

Primary.args = {
  bill: {
    id: "H805",
    court: 192,
    content: {
      Title:
        "An Act fostering voting opportunities, trust, equity, and security",
      BillNumber: "H805",
      DocketNumber: "string",
      GeneralCourtNumber: 999,
      PrimarySponsor: first,
      Cosponsors: [first],
      LegislationTypeName: "string",
      Pinslip: "string",
      DocumentText: "string"
    },
    cosponsorCount: 0,
    testimonyCount: 0,
    endorseCount: 0,
    opposeCount: 0,
    neutralCount: 0,
    fetchedAt: Timestamp.fromMillis(0),
    history: [
      {
        Date: "1",
        Branch: "1",
        Action: "1"
      }
    ]
  }
}
