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
  variant
}) => {
  return (
    <DropdownButton title={title} variant={variant}>
      {children}
    </DropdownButton>
  )
}

export const Primary = Template.bind({})
Primary.args = {
  title: "Title",
  children: ["Item1", "Item2", "Item3"],
  variant: "secondary"
}
