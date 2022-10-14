import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { CardListItems } from "../../../components/Card"

export default createMeta({
  title: "Components/Cards/CardListItem",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=119%3A2727",
  component: CardListItems
})

const Template: ComponentStory<typeof CardListItems> = ({
  cardItems,
  children,
  ...rest
}) => {
  return (
    <CardListItems cardItems={cardItems} {...rest}>
      {children}
    </CardListItems>
  )
}

export const Primary = Template.bind({})
Primary.args = {
  cardItems: [
    {
      billName: "H.3330",
      billDescription: "Important bill, must vote!"
    }
  ]
}

export const OnlyBillName = Template.bind({})
OnlyBillName.args = {
  cardItems: [
    {
      billName: "H.3330"
    }
  ]
}

export const MultipleItems = Template.bind({})
MultipleItems.args = {
  cardItems: [
    {
      billName: "H.3330",
      billDescription: "Important bill, must vote!"
    },
    {
      billName: "H.3331",
      billDescription: "Important bill, must vote!"
    },
    {
      billName: "H.3332",
      billDescription: "Important bill, must vote!"
    }
  ]
}
