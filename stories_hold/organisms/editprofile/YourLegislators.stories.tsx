import { ComponentStory } from "@storybook/react"
import { YourLegislators } from "components/EditProfilePage/YourLegislators"
import { LegislatorForm } from "components/ProfilePage/SelectLegislators"
import { MemberSearchIndex, Profile, ProfileHook } from "components/db"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Organisms/Edit Profile/LegislatorForm",
  component: LegislatorForm,
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

const Template: ComponentStory<typeof LegislatorForm> = args => (
  <LegislatorForm {...args} />
)

export const Primary = Template.bind({})
Primary.storyName = "LegislatorForm"
Primary.args = {
  index: {
    representatives: [
      // MemberSearchIndexItem
      {
        MemberCode: "CRF1",
        Name: "Rep Name",
        District: "District",
        EmailAddress: "rep@ma.gov",
        Party: "D",
        Branch: "House"
      },
      {
        MemberCode: "CRF1",
        Name: "Rep Name",
        District: "District",
        EmailAddress: "rep@ma.gov",
        Party: "D",
        Branch: "House"
      },
      {
        MemberCode: "CRF1",
        Name: "Rep Name",
        District: "District",
        EmailAddress: "rep@ma.gov",
        Party: "D",
        Branch: "House"
      },
      {
        MemberCode: "CRF1",
        Name: "Rep Name",
        District: "District",
        EmailAddress: "rep@ma.gov",
        Party: "D",
        Branch: "House"
      }
    ],
    senators: [
      {
        MemberCode: "CRF1",
        Name: "Senator Name",
        District: "District",
        EmailAddress: "sen@ma.gov",
        Party: "D",
        Branch: "Senate"
      },
      {
        MemberCode: "CRF1",
        Name: "Senator Name",
        District: "District",
        EmailAddress: "sen@ma.gov",
        Party: "D",
        Branch: "Senate"
      },
      {
        MemberCode: "CRF1",
        Name: "Senator Name",
        District: "District",
        EmailAddress: "sen@ma.gov",
        Party: "D",
        Branch: "Senate"
      },
      {
        MemberCode: "CRF1",
        Name: "Senator Name",
        District: "District",
        EmailAddress: "sen@ma.gov",
        Party: "D",
        Branch: "Senate"
      }
    ]
  },
  profile: {} as ProfileHook
}
