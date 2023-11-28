import { ComponentStory } from "@storybook/react"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { createMeta } from "stories/utils"
import { EditProfileForm } from "components/EditProfilePage/EditProfilePage"
import { Profile } from "functions/src/profile/types"
import { ContactInfo, ProfileHook } from "components/db"

export default createMeta({
  title: "Profile/EditProfileForm",
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
})

const Template: ComponentStory<typeof EditProfileForm> = args => (
  <EditProfileForm {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
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
}
Primary.storyName = "EditProfileForm"
