import { Meta, StoryObj } from "@storybook/react"
import { TestimonyItem } from "components/TestimonyCard/TestimonyItem"
import { createMockTestimony } from "components/moderation/setUp/MockRecords"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Organisms/Testimony/Testimony Item",
  component: TestimonyItem,
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

type Story = StoryObj<typeof TestimonyItem>

export const Primary: Story = {
  args: {
    testimony: createMockTestimony("H1002", "userId"),
    isUser: true,
    onProfilePage: true
  },
  name: "Testimony Item"
}
