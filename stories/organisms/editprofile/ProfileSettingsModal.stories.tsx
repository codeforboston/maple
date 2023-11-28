import { ComponentStory } from "@storybook/react"
import ProfileSettingsModal from "components/EditProfilePage/ProfileSettingsModal"
import { GearButton } from "components/buttons"
import { ProfileHook } from "components/db"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { useState } from "react"
import { Col } from "react-bootstrap"
import { Provider as Redux } from "react-redux"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Profile/ProfileSettingsModal",
  component: ProfileSettingsModal,
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

const Template: ComponentStory<typeof ProfileSettingsModal> = args => (
  <ProfileSettingsModal {...args} />
)

export const Primary = Template.bind({})
Primary.args = {
  actions: {} as ProfileHook,
  isProfilePublic: true,
  role: "user",
  notifications: "Daily",
  show: true
}

Primary.storyName = "ProfileSettingsModal"
