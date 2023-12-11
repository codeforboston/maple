import { Meta, StoryObj } from "@storybook/react"
// import { ValuePlaque } from "components/Policies/ValuePlaque"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"

const ValuePlaque = () => {
  return <div>TODO</div>
}

const meta: Meta = {
  title: "Atoms/Plaque",
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
}

type Story = StoryObj<typeof ValuePlaque>

export const Primary: Story = {
  args: {
    src: "handShake.jpg",
    alt: "hand shake",
    title: "Humility"
  },
  name: "ValuePlaque"
}


export default meta