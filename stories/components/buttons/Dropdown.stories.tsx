import { createMeta } from "stories/utils"
import { DropdownGeneric } from "../../../components/shared/Dropdown/DropdownGeneric"
import { ComponentStory } from "@storybook/react"

export default createMeta({
  title: "Components/Buttons/Dropdown",
  figmaUrl:
    "https://www.figma.com/file/pGGIX2tmCWJNGU1sAYQ91v/FAQ?type=design&node-id=4001-29831&mode=design&t=j7usRSbamiOgLWlC-0",
  component: DropdownGeneric
})

const Template: ComponentStory<typeof DropdownGeneric> = ({
  title,
  children,
  variant,
  styling
}) => {
  return (
    <DropdownGeneric title={title} styling={styling} variant={variant}>
      {children}
    </DropdownGeneric>
  )
}

export const Primary = Template.bind({})
Primary.args = {
  title: "Title",
  children: ["Item1", "Item2", "Item3"],
  variant: "secondary",
  styling: {
    width: { desktop: "418px", mobile: "418px" },
    height: "40px",
    fontSize: "1rem"
  }
}
