import { ComponentStory } from "@storybook/react"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { createMeta } from "stories/utils"
import PageFooter from "../../../components/Footer/Footer"

// import i18n from "i18next"

export default createMeta({
  title: "Components/Page/PageFooter",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=49%3A3010",
  component: PageFooter
})

const Template: ComponentStory<typeof PageFooter> = args => {
  return <PageFooter {...args} />
}

export const Primary = Template.bind({})

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

Primary.args = {
  authenticated: true,
  user: null,
  signOut: () => {}
}
