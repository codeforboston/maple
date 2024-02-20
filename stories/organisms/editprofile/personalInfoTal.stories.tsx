import { Meta, StoryObj } from "@storybook/react"
import { PersonalInfoTab } from "components/EditProfilePage/PersonalInfoTab"
import { ProfileHook } from "components/db"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

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
      notificationFrequency: "Daily",
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
    isOrg: false
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
      notificationFrequency: "Daily",
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
