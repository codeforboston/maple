import { Meta, StoryObj } from "@storybook/react"
import { PhoneVerificationModal } from "components/shared/PhoneVerificationModal"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Organisms/PhoneVerificationModal",
  component: PhoneVerificationModal,
  decorators: [
    (Story, ...rest) => {
      const { store } = wrapper.useWrappedStore(...rest)

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

type Story = StoryObj<typeof PhoneVerificationModal>

export const PhoneStep: Story = {
  args: {
    show: true,
    onHide: () => {},
    onVerified: () => {},
    initialStep: "phone"
  },
  name: "Phone Step"
}

export const CodeStep: Story = {
  args: {
    show: true,
    onHide: () => {},
    onVerified: () => {},
    initialStep: "code"
  },
  name: "Code Step"
}

export const SuccessStep: Story = {
  args: {
    show: true,
    onHide: () => {},
    onVerified: () => {},
    initialStep: "success"
  },
  name: "Success Step"
}
