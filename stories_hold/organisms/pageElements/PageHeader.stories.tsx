import { createMeta } from "stories/utils"
import HeroHeader from "components/HeroHeader/HeroHeader"
import { Meta, StoryObj } from "@storybook/react"
import { appWithTranslation } from "next-i18next"

// export default createMeta({
//   title: "Organisms/Page Elements/PageHeader",
//   figmaUrl:
//     "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=158%3A6642",
//   component: HeroHeader
// })

type Story = StoryObj<typeof HeroHeader>

export const Primary: Story = {
  args: { authenticated: true }, name: "PageHeader"
}
