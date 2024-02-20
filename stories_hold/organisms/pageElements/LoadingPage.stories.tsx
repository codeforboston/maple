import { ComponentStory } from "@storybook/react"
import { Loading } from "components/LoadingPage"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Organisms/Page Elements/LoadingPage",
  component: Loading
})

const Template: ComponentStory<typeof Loading> = () => <Loading />

export const Primary = Template.bind({})
Primary.storyName = "LoadingPage"
