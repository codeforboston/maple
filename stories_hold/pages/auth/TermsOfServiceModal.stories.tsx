import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import TermsOfServiceModal from "components/auth/TermsOfServiceModal"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

export default createMeta({
  title: "Pages/Auth/Terms Of Service Modal",
  component: TermsOfServiceModal
})

const Template: ComponentStory<typeof TermsOfServiceModal> = args => (
  <TermsOfServiceModal {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  onHide: () => {},
  show: true,
  onAgree: () => {}
}
Primary.storyName = "Terms Of Service Modal"

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
