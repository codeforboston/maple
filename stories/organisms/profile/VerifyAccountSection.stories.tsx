import { ComponentStory } from "@storybook/react"
import { VerifyAccountSection } from "components/ProfilePage/VerifyAccountSection"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { User } from "firebase/auth"
import { Col, Row } from "react-bootstrap"
import { Provider as Redux } from "react-redux"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Organisms/Profile/VerifyAccountSection",
  component: VerifyAccountSection,
  decorators: [
    (Story, ...rest) => (
      <Row>
        <Col>
          <Story {...rest} />
        </Col>
      </Row>
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
  ],
  parameters: {
    backgrounds: { name: "medium", value: "#f4f4f4" }
  }
})

const Template: ComponentStory<typeof VerifyAccountSection> = args => (
  <VerifyAccountSection {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  className: "mb-4",
  user: {} as User
}

Primary.storyName = "VerifyAccountSection"
