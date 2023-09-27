import { createMeta } from "stories/utils"
import { GlobalSearchBar }from "../../components/GlobalSearchBar/GlobalSearchBar"
import { ComponentStory } from "@storybook/react"


export default createMeta({
  title: "Components/GlobalSearchBar",
  component: GlobalSearchBar
})


const Template: ComponentStory<typeof GlobalSearchBar> = () => {
  return <GlobalSearchBar></GlobalSearchBar>
}

export const Primary = Template.bind({})
Primary.args = {
}
