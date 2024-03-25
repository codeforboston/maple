import { Meta, StoryObj } from "@storybook/react"
import StartModal from "components/auth/StartModal"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Pages/Auth/Start Modal",
  component: StartModal,
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

type Story = StoryObj<typeof StartModal>

export const Primary: Story = {
  args: {
    onHide: () => {},
    show: true,
    onSignInClick: () => {},
    onSignUpClick: () => {}
  },
  name: "Start Modal"
}

export default meta
