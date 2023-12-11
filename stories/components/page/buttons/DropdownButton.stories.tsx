import { createMeta } from "stories/utils"
import DropdownButton from "components/DropdownButton/DropdownButton"
import { ComponentStory, Meta, StoryObj } from "@storybook/react"

const meta: Meta = {
  title: "Molecules/Buttons/DropdownButton",
  component: DropdownButton
}

/* export const Primary = () => <DropdownButton title="Dropdown"> </DropdownButton>  */

export default meta

type Story = StoryObj<typeof DropdownButton>

export const Primary: Story = {
  args: {
    children: ["Action 5", "Action 6", "Action 7"]
  }
}
