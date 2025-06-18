import { Meta, StoryObj } from "@storybook/react"
import { EditProfileHeader } from "components/EditProfilePage/EditProfileHeader"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Organisms/Edit Profile/Edit Profile Header",
  component: EditProfileHeader,
  decorators: [
    (Story, ...rest) => <Story {...rest} />,
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

type Story = StoryObj<typeof EditProfileHeader>

type ProfileHeaderProps = React.ComponentProps<typeof EditProfileHeader>
export const Primary: Story = {
  args: {
    formUpdated: false,
    onSettingsModalOpen: () => console.log("Settings Modal Open"),
    uid: "yem5wVGQnpc7tXWgt16ofbiU9F23",
    role: "user"
  },
  name: "EditProfileHeader"
}

export default meta
