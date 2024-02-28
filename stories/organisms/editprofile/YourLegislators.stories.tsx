import { Meta, StoryObj } from "@storybook/react"
import { LegislatorForm } from "components/ProfilePage/SelectLegislators"
import { ProfileHook } from "components/db"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
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
}

export default meta

type Story = StoryObj<typeof LegislatorForm>

export const Primary: Story = {
  name: "LegislatorForm",
  args: {
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
}
