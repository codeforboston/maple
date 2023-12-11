import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { BillDetails } from "components/bill/BillDetails"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { bill } from "../organisms/billDetail/MockBillData"

export default createMeta({
  title: "Pages/BillDetails",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=49%3A3010",
  component: BillDetails
})

const Template: ComponentStory<typeof BillDetails> = args => (
  <BillDetails {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  bill: bill
}

Primary.decorators = [
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
