import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import SignInModal from "components/auth/SignInModal"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

export default createMeta({
  title: "Pages/Auth/Sign In Modal",
  component: SignInModal
})

const Template: ComponentStory<typeof SignInModal> = args => (
  <SignInModal {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  onHide: () => {},
  show: true,
  onForgotPasswordClick: () => {}
}
Primary.storyName = "Sign In Modal"
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
