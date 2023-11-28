import { createMeta } from "stories/utils"
import HeroHeader from "components/HeroHeader/HeroHeader"
import { ComponentStory } from "@storybook/react"
import { appWithTranslation } from "next-i18next"

// TODO: move into components directory
// const PageHeader = () => <div>TODO</div>

export default createMeta({
  title: "Components/Page/PageHeader",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=158%3A6642",
  component: HeroHeader
})

const Template: ComponentStory<typeof HeroHeader> = args => (
  <HeroHeader {...args} />
)

export const Primary = Template.bind({})

Primary.args = { authenticated: true }
