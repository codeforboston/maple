import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import ProfileTypeModal from "../../../../components/auth/ProfileTypeModal"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

export default createMeta({
  title: "Auth/Profile Type Modal",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=49%3A3010",
  component: ProfileTypeModal
})

const Template: ComponentStory<typeof ProfileTypeModal> = args => (
  <ProfileTypeModal {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  onIndividualUserClick: () => {},
  onOrgUserClick: () => {},
  onHide: () => {},
  show: true
}
Primary.storyName = "Profile Type Modal"
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
