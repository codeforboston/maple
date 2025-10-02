import { Meta, StoryObj } from "@storybook/react"
import { BillTestimonies } from "components/bill/BillTestimonies"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Timestamp } from "firebase/firestore"
import { Provider as Redux } from "react-redux"

const BillTestimonyListCard = BillTestimonies

const meta: Meta = {
  title: "Organisms/Bill Detail/BillTestimonyListCard",
  component: BillTestimonyListCard
}

export default meta

var first = { Id: "test", Name: "tes", Type: 0 }

type Story = StoryObj<typeof BillTestimonyListCard>

export const Primary: Story = {
  args: {
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
      ],
      similar: []
    }
  },
  name: "BillTestimonyListCard",
  decorators: [
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
}
