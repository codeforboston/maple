import { ComponentStory } from "@storybook/react"
import { ProfileLegislators } from "components/ProfilePage/ProfileLegislators"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Organisms/Profile/ProfileLegislators",
  component: ProfileLegislators,
  decorators: [
    (Story, ...rest) => <Story {...rest} />,
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

const Template: ComponentStory<typeof ProfileLegislators> = args => (
  <ProfileLegislators {...args} />
)

export const Primary = Template.bind({})

Primary.storyName = "ProfileLegislators"
Primary.args = {
  rep: {
    district: "1",
    id: "CRF1",
    name: "Rep. 1"
  },
  senator: {
    district: "1",
    id: "A_G0",
    name: "Sen. 1"
  }
}
