import { Meta, StoryObj } from "@storybook/react"
import { User } from "firebase/auth"
import { VerifyAccountSection } from "components/shared/VerifyAccountSection"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Organisms/VerifyAccountSection",
  component: VerifyAccountSection,
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

type Story = StoryObj<typeof VerifyAccountSection>

export const Primary: Story = {
  args: {
    user: { emailVerified: false } as User,
    profile: {
      topicName: "Your Topic Name",
      role: "user",
      fullName: "Matt Doe",
      email: "anotherMatt@example.com",
      phoneVerified: false
    },
    className: ""
  },
  name: "VerifyAccountSection"
}
