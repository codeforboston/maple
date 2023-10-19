import { ComponentStory } from "@storybook/react"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { createMeta } from "stories/utils"
import PolicyPage from "../../components/Policies/PolicyPage"

export default createMeta({
  title: "Education/PolicyPage",
  component: PolicyPage,
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

const Template: ComponentStory<typeof PolicyPage> = () => <PolicyPage />

export const Primary = Template.bind({})

Primary.storyName = "PolicyPage"
