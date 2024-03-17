import { Meta, StoryObj } from "@storybook/react"
import { TestimoniesTab } from "components/EditProfilePage/TestimoniesTab"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Organisms/Edit Profile/Testimonies Tab",
  component: TestimoniesTab,
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

type Story = StoryObj<typeof TestimoniesTab>

export const Primary: Story = {
  args: {
    publishedTestimonies: [],
    draftTestimonies: []
  }
}

export default meta
