import { ComponentStory } from "@storybook/react"
import { ProfileHeader } from "components/ProfilePage/ProfileHeader"
import { StyledContainer } from "components/ProfilePage/StyledProfileComponents"
import { Profile } from "components/db"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Profile/Pages/ProfileHeader",
  component: ProfileHeader,
  decorators: [
    (Story, ...rest) => (
      <StyledContainer>
        <Story {...rest} />
      </StyledContainer>
    ),
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

const Template: ComponentStory<typeof ProfileHeader> = args => (
  <ProfileHeader {...args} />
)

export const Primary = Template.bind({})

type ProfileHeaderProps = React.ComponentProps<typeof ProfileHeader>
Primary.args = {
  isUser: true,
  isOrg: false,
  isProfilePublic: false,
  uid: "yem5wVGQnpc7tXWgt16ofbiU9F23",
  profileId: "yem5wVGQnpc7tXWgt16ofbiU9F23",
  profile: {
    topicName: "Topic Name",
    role: "user",
    fullName: "Full Name",
    displayName: "Display Name",
    photoURL: "https://via.placeholder.com/150"
  } as Profile,
  isMobile: false,
  onProfilePublicityChanged: (isPublic: boolean) => console.log(isPublic)
} as ProfileHeaderProps

Primary.storyName = "ProfileHeader"
