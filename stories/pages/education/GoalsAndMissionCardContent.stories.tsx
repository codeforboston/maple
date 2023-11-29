import { ComponentStory } from "@storybook/react"
import { Providers } from "components/providers"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { createMeta } from "stories/utils"
import GoalsAndMission from "components/GoalsAndMission/GoalsAndMission"

export default createMeta({
  title: "Pages/Education/GoalsAndMission",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=49%3A3010",
  component: GoalsAndMission,
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

const Template: ComponentStory<typeof GoalsAndMission> = () => (
  <GoalsAndMission />
)

export const Primary = Template.bind({})

Primary.storyName = "GoalsAndMission"
