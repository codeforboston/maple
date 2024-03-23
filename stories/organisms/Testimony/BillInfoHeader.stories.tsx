import { Meta, StoryObj } from "@storybook/react"
import { BillInfoHeader } from "components/TestimonyCard/BillInfoHeader"
import { createMockTestimony } from "components/moderation/setUp/MockRecords"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

// TODO: move into components directory

const meta: Meta = {
  title: "Organisms/Testimony/BillInfoHeader",
  component: BillInfoHeader,
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
export default meta

type Story = StoryObj<typeof BillInfoHeader>

export const Primary: Story = {
  args: {
    testimony: createMockTestimony("H1002", "userId"),
    billLink: "#",
    publishedDate: "2021-08-11"
  },
  name: "BillInfoHeader"
}
