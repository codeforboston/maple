import { Meta, StoryObj } from "@storybook/react"
import { UserInfoHeader } from "components/TestimonyCard/UserInfoHeader"
import { createMockTestimony } from "components/moderation/setUp/MockRecords"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Organisms/Testimony/UserInfoHeader",
  component: UserInfoHeader,
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

type Story = StoryObj<typeof UserInfoHeader>

export const Primary: Story = {
  args: {
    testimony: createMockTestimony("H1002", "userId"),
    billLink: "#",
    publishedDate: "2021-08-11"
  },
  name: "UserInfoHeader"
}
