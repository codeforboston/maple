import { Meta, StoryObj } from "@storybook/react"
import { EditProfileForm } from "components/EditProfilePage/EditProfilePage"
import { ProfileHook } from "components/db"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Pages/EditProfile",
  component: EditProfileForm,
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

/* The 'editprofileform' component is the visual top for the edit profile page. The EditProfile component that wraps it provides the user data from hooks, but we can pass it as an object here. As we build out providers and mocking in storybook we can revisit this. */
type Story = StoryObj<typeof EditProfileForm>

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
    uid: "123"
  },
  name: "EditProfile"
}
