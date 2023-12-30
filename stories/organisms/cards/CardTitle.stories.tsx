import { Meta, StoryObj } from "@storybook/react"
import { CardTitle } from "../../../components/Card"

const meta: Meta = {
  title: "Organisms/Cards/CardTitle",
  component: CardTitle
}

export default meta

type Story = StoryObj<typeof CardTitle>

export const Primary: Story = {
  args: {
    header: "Header",
    subheader: "Subheader here don't miss it",
    timestamp: "3:29PM",
    imgSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/How_to_use_icon.svg/2214px-How_to_use_icon.svg.png"
  }
}
