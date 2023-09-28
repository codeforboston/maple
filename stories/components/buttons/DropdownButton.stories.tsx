import { createMeta } from "stories/utils"
import { DropdownButton } from "../../../components/shared/DropdownButton/DropdownButton"
import { ComponentStory } from "@storybook/react"

export default createMeta({
  title: "Components/Buttons/DropdownButton",
  figmaUrl:
    "https://www.figma.com/file/pGGIX2tmCWJNGU1sAYQ91v/FAQ?type=design&node-id=4001-29831&mode=design&t=j7usRSbamiOgLWlC-0",
  component: DropdownButton
})

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
  title: "Title",
  children: ["Item 1", "Item 2", "Item 3"],
  styling: {
    width: { desktop: "418px", mobile: "418px" },
    height: "40px",
    color: "#FFFFFF",
    backgroundColor: "#1a3185",
    fontSize: "16px"
  }
}
