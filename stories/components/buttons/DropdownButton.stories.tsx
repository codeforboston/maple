import { createMeta } from "stories/utils"
import { DropdownButton } from "../../../components/shared/DropdownButton/DropdownButton"
import { ComponentStory } from "@storybook/react"

// TODO: move into components directory
//const DropdownButton = () => <div>TODO</div>

export default createMeta({
  title: "Components/Buttons/DropdownButton",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=245%3A12483",
  component: DropdownButton
})

/* export const Primary = () => <DropdownButton title="Dropdown"> </DropdownButton>  */

const Template: ComponentStory<typeof DropdownButton> = ({
  title,
  children,
  styling
}) => {
  return (
    <DropdownButton title={title} styling={styling}>
      {children}
    </DropdownButton>
  )
}

export const Primary = Template.bind({})
Primary.args = {
  title: "",
  children: ["Action 5", "Action 6", "Action 7"],
  styling: {
    width: { desktop: "", mobile: "" },
    height: "",
    color: "",
    backgroundColor: "",
    fontSize: ""
  }
}
