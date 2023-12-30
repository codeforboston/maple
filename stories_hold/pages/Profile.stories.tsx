import { ComponentStory } from "@storybook/react"
import { ProfilePage } from "components/ProfilePage"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Pages/ProfilePage",
  component: ProfilePage,
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
})

const Template: ComponentStory<typeof ProfilePage> = args => (
  <ProfilePage {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  id: "yem5wVGQnpc7tXWgt16ofbiU9F23",
  verifyisorg: false
}

Primary.storyName = "ProfilePage"
