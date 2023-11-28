import { ComponentStory } from "@storybook/react"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { createMeta } from "stories/utils"
import { ValuePlaque } from "../../components/Policies/ValuePlaque"

export default createMeta({
  title: "Education/ValuePlaque",
  component: ValuePlaque,
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

const Template: ComponentStory<typeof ValuePlaque> = args => (
  <ValuePlaque {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  src: "handShake.jpg",
  alt: "hand shake",
  title: "Humility"
}

Primary.storyName = "ValuePlaque"
