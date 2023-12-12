import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { BillDetails } from "components/bill/BillDetails"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { bill } from "../../stories/organisms/billDetail/MockBillData"

export default createMeta({
  title: "Pages/BillDetails",
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
