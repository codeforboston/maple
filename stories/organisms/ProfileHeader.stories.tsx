import { Meta, StoryObj } from "@storybook/react"
import { ProfileHeader } from "components/ProfilePage/ProfileHeader"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Organisms/Profile/ProfileHeader",
  component: ProfileHeader,
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

type Story = StoryObj<typeof ProfileHeader>

// ProfileHeaderProps out of date

// type ProfileHeaderProps = React.ComponentProps<typeof ProfileHeader>
// export const Primary: Story = {
//   args: {
//     isUser: true,
//     isOrg: false,
//     isProfilePublic: false,
//     uid: "yem5wVGQnpc7tXWgt16ofbiU9F23",
//     profileId: "yem5wVGQnpc7tXWgt16ofbiU9F23",
//     profile: {
//       topicName: "Topic Name",
//       role: "user",
//       fullName: "Full Name",
//       displayName: "Display Name",
//       photoURL: "https://via.placeholder.com/150",
//       contactInfo: {
//         publicEmail: "email@example.com",
//         publicPhone: 6179990808,
//         website: "example.com"
//       }
//     } as Profile,
//     isMobile: false,
//     onProfilePublicityChanged: (isPublic: boolean) => console.log(isPublic)
//   } as ProfileHeaderProps,
//   argTypes: {
//     isUser: {
//       control: { type: "boolean" },
//       name: "isUser: Is the current viewer the owner of the profile?"
//     },
//     isOrg: { control: { type: "boolean" }, name: "isOrg: Is the owner an org" },
//     isProfilePublic: { control: { type: "boolean" } }
//   },
//   name: "ProfileHeader"
// }

export default meta
