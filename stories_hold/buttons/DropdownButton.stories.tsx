import { createMeta } from "stories/utils"
import DropdownButton from "../../components/DropdownButton/DropdownButton"
import { ComponentStory } from "@storybook/react"

// TODO: move into components directory
//const DropdownButton = () => <div>TODO</div>

export default createMeta({
  title: "Components/Buttons/DropdownButton",
  component: DropdownButton
})

/* export const Primary = () => <DropdownButton title="Dropdown"> </DropdownButton>  */

const Template: ComponentStory<typeof DropdownButton> = ({
  title,
  children
}) => {
  return <DropdownButton title={title}>{children}</DropdownButton>
}

export const Primary = Template.bind({})
Primary.args = {
  children: ["Action 5", "Action 6", "Action 7"]
}
