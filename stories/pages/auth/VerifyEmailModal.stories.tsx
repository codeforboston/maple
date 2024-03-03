import { Meta, StoryObj } from "@storybook/react"
import VerifyEmailModal from "components/auth/VerifyEmailModal"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Pages/Auth/Verify Email Modal",
  component: VerifyEmailModal,
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

type Story = StoryObj<typeof VerifyEmailModal>

export const Primary: Story = {
  args: {
    onHide: () => { },
    show: true,
  },
  name: "Verify Email Modal"
}




export default meta