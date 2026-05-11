import { Meta, StoryObj } from "@storybook/react"
import { PersonalInfoTab } from "components/EditProfilePage/PersonalInfoTab"
import { MemberSearchIndex, ProfileHook } from "components/db"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const mockIndex: MemberSearchIndex = {
  representatives: [
    {
      MemberCode: "H-001",
      Name: "Rep. Ada Lovelace",
      District: "1st Middlesex",
      EmailAddress: "ada.lovelace@malegislature.gov",
      Party: "D",
      Branch: "House"
    }
  ],
  senators: [
    {
      MemberCode: "S-001",
      Name: "Sen. Grace Hopper",
      District: "Middlesex & Suffolk",
      EmailAddress: "grace.hopper@malegislature.gov",
      Party: "D",
      Branch: "Senate"
    }
  ]
}

const mockProfile = {
  loading: false,
  updatingRep: false,
  updatingSenator: false,
  profile: {
    representative: {
      id: "H-001",
      name: "Rep. Ada Lovelace",
      district: "1st Middlesex"
    },
    senator: {
      id: "S-001",
      name: "Sen. Grace Hopper",
      district: "Middlesex & Suffolk"
    }
  },
  updateRep: () => undefined,
  updateSenator: () => undefined
} as unknown as ProfileHook

const meta: Meta = {
  title: "Organisms/Edit Profile/Personal Info Tab",
  component: PersonalInfoTab,
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

type Story = StoryObj<typeof PersonalInfoTab>

export const Primary: Story = {
  args: {
    profile: {
      topicName: "Your Topic Name",
      role: "user",
      fullName: "John Doe",
      email: "johndoe@example.com",
      representative: {
        id: "123",
        name: "Jane Smith",
        district: "District 1"
      },
      public: true,
      notificationFrequency: "Weekly",
      about: "About me",
      social: {
        twitter: "johndoe",
        linkedIn: "",
        instagram: "",
        fb: ""
      },
      profileImage: "https://example.com/profile.jpg",
      billsFollowing: ["bill1", "bill2"],
      location: "New York",
      orgCategories: ["Education", "Other"]
    },
    actions: {} as ProfileHook,
    uid: "123",
    className: "",
    setFormUpdated: () => console.log("setFormUpdated"),
    isOrg: false,
    legislatorsProps: {
      index: mockIndex,
      profile: mockProfile
    }
  },
  name: "Personal Info Tab"
}

export const Org: Story = {
  args: {
    profile: {
      topicName: "Your Topic Name",
      role: "organization",
      fullName: "John Doe",
      email: "johndoe@example.com",
      representative: {
        id: "123",
        name: "Jane Smith",
        district: "District 1"
      },
      public: true,
      notificationFrequency: "Weekly",
      about: "About me",
      social: {
        twitter: "johndoe",
        linkedIn: "",
        instagram: "",
        fb: ""
      },
      profileImage: "https://example.com/profile.jpg",
      billsFollowing: ["bill1", "bill2"],
      location: "New York",
      orgCategories: ["Education", "Other"]
    },
    actions: {} as ProfileHook,
    uid: "123",
    className: "",
    setFormUpdated: () => console.log("setFormUpdated"),
    isOrg: true
  },
  name: "Organizational Info Tab "
}

export default meta
