import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import OrgSignUpModal from "../../../components/auth/OrgSignUpModal"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

export default createMeta({
  title: "Auth/OrgSignUpModal",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=49%3A3010",
  component: OrgSignUpModal
})

const Template: ComponentStory<typeof OrgSignUpModal> = args => (
  <OrgSignUpModal {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  onSuccessfulSubmit: () => {},
  onHide: () => {},
  show: true
}

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
