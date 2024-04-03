import { Meta, StoryObj } from "@storybook/react"
import ProfileSettingsModal from "components/EditProfilePage/ProfileSettingsModal"
import { ProfileHook } from "components/db"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { Image } from "components/bootstrap"

const meta: Meta = {
  title: "Organisms/Edit Profile/ProfileSettingsModal",
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
}

export default meta

type Story = StoryObj<typeof ProfileSettingsModal>

export const Primary: Story = {
  args: {
    actions: {} as ProfileHook,
    isProfilePublic: true,
    role: "user",
    notifications: "Daily",
    show: true
  },
  name: "ProfileSettingsModal"
}

const EmailIcon = () => {
  return (
    <>
      <Image
        className={`pe-1`}
        src="/mail.svg"
        alt="open envelope with letter, toggles update frequency options"
        width="22"
        // height="19"
      />
    </>
  )
}

export { EmailIcon }
