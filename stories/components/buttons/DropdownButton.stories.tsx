import { createMeta } from "stories/utils"
import { DropdownButton } from "../../../components/shared/DropdownButton/DropdownButton"
import { ComponentStory } from "@storybook/react"
import { DropdownButtonProps } from "../../../components/shared/DropdownButton/DropdownButton"

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

// export const Primary = Template.bind({})
// Primary.args = {
//   title: "Title",
//   children:[{id: 1, itemName: "item1"}, {id: 2, itemName: "item2"}, {id: 3, itemName: "item3"}],
//   styling: {
//     width: { desktop: "418px", mobile: "418px" },
//     height: "40px",
//     fontSize: "16px"
//   }
// }
