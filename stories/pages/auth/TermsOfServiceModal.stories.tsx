import { Meta, StoryObj } from "@storybook/react"
import TermsOfServiceModal from "components/auth/TermsOfServiceModal"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Pages/Auth/Terms Of Service Modal",
  component: TermsOfServiceModal,
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

type Story = StoryObj<typeof TermsOfServiceModal>

export const Primary: Story = {
  args: {
    onHide: () => { },
    show: true,
    onAgree: () => { }
  },
  name: "Terms Of Service Modal"
}




export default meta