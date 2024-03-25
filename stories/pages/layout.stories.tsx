import { Meta, StoryObj } from "@storybook/react"
import { Layout } from "components/layout"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const meta: Meta = {
  title: "Pages/Layout",
  component: Layout,
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

type Story = StoryObj<typeof Layout>

export const Primary: Story = {
  args: {},
  name: "Layout"
}
export default meta
