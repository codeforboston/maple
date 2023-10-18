import { createMeta } from "stories/utils"
import { ComponentStory } from "@storybook/react"
import { ProfilePage } from "components/ProfilePage"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { Providers } from "components/providers"
import { signInUser1 } from "tests/integration/common"
import { ProfileHeader } from "components/ProfilePage/ProfileHeader"
import { Profile } from "components/db"
import { StyledContainer } from "components/ProfilePage/StyledProfileComponents"

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
  isMobile: false,
  uid: "123",
  profileId: "123",
  profile: {} as Profile,
  isUser: true,
  isOrg: false,
  isProfilePublic: true,
  onProfilePublicityChanged: (isPublic: boolean) => console.log(isPublic)
} as ProfileHeaderProps

Primary.storyName = "ProfileHeader"
