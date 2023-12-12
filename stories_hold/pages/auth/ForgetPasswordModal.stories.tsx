import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import ForgotPasswordModal from "components/auth/ForgotPasswordModal"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

export default createMeta({
  title: "Pages/Auth/ForgotPasswordModal",
  component: ForgotPasswordModal
})

const Template: ComponentStory<typeof ForgotPasswordModal> = args => (
  <ForgotPasswordModal {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  onHide: () => {},
  show: true
}
Primary.storyName = "ForgotPasswordModal"

Primary.decorators = [
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
