import { ComponentStory } from "@storybook/react"
import { Loading } from "components/LoadingPage"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Components/Page/LoadingPage",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=49%3A3010",
  component: Loading
})

const Template: ComponentStory<typeof Loading> = () => <Loading />

export const Primary = Template.bind({})
