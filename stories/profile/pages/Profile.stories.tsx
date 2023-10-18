import { createMeta } from "stories/utils"
import { ComponentStory } from "@storybook/react"
import { ProfilePage } from "components/ProfilePage"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { Providers } from "components/providers"
import { signInUser1 } from "tests/integration/common"
import { User } from "firebase/auth"
import { useState } from "react"

export default createMeta({
  title: "Profile/Pages/ProfilePage",
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
  id: "123",
  verifyisorg: false
}


Primary.storyName = "ProfilePage"
