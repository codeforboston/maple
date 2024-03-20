import { Meta, StoryObj } from "@storybook/react"
import { EditProfileHeader } from "components/EditProfilePage/EditProfileHeader"
import { ProfileButtonsUser } from "components/ProfilePage/ProfileButtons"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Col, Row } from "react-bootstrap"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Atoms/Buttons/Profile Buttons",
  component: ProfileButtonsUser,
  decorators: [
    (Story, ...rest) => {
      const { store, props } = wrapper.useWrappedStore(...rest)

      return (
        <Redux store={store}>
          <Providers>
            <Row>
              <Col className="col-4">
                <Story />
              </Col>
            </Row>
          </Providers>
        </Redux>
      )
    }
  ]
}

export default meta

type Story = StoryObj<typeof ProfileButtonsUser>

export const Primary: Story = {
  args: {
    isProfilePublic: true,
    onProfilePublicityChanged: () => {
      console.log("clicked")
    }
  },
  argTypes: {
    isProfilePublic: { control: { type: "boolean" } }
  },
  name: "Profile Buttons"
}
