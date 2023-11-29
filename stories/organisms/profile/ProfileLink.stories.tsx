import { ComponentStory } from "@storybook/react"
import { ProfileLinkView } from "components/ProfileLink/ProfileLink"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Col, Row } from "react-bootstrap"
import { Provider as Redux } from "react-redux"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Organisms/Profile/ProfileLink",
  component: ProfileLinkView,
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
})

const Template: ComponentStory<typeof ProfileLinkView> = args => (
  <ProfileLinkView {...args} />
)

export const Primary = Template.bind({})
Primary.storyName = "ProfileLink"
Primary.args = {
  fullName: "John Doe",
  role: "user",
  sticky: false,
  isExpanded: false,
  toggleNav: () => {},
  closeNav: () => {},
  userLink: "/profile?id=123"
}
export const Secondary = Template.bind({})
Secondary.storyName = "ProfileLink Expanded"
Secondary.args = {
  fullName: "John Doe",
  role: "user",
  sticky: false,
  isExpanded: true,
  toggleNav: () => {},
  closeNav: () => {},
  userLink: "/profile?id=123"
}
