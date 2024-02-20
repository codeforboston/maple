import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { CardTitle } from "../../../components/Card"

export default createMeta({
  title: "Components/Cards/CardTitle",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=110%3A2655",
  component: CardTitle
})

const Template: ComponentStory<typeof CardTitle> = ({
  header,
  subheader,
  timestamp,
  imgSrc,
  ...rest
}) => {
  return (
    <CardTitle
      header={header}
      subheader={subheader}
      timestamp={timestamp}
      imgSrc={imgSrc}
      {...rest}
    />
  )
}

export const Primary = Template.bind({})

export const JustHeader = Template.bind({})
JustHeader.args = {
  header: "Header"
}

export const HeaderAndSubheader = Template.bind({})
HeaderAndSubheader.args = {
  header: "Header",
  subheader: "Subheader here don't miss it"
}

export const HeaderAndSubheaderAndTimestamp = Template.bind({})
HeaderAndSubheaderAndTimestamp.args = {
  header: "Header",
  subheader: "Subheader here don't miss it",
  timestamp: "3:29PM"
}

export const HeaderAndSubheaderAndTimestampAndImg = Template.bind({})
HeaderAndSubheaderAndTimestampAndImg.args = {
  header: "Header",
  subheader: "Subheader here don't miss it",
  timestamp: "3:29PM",
  imgSrc:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/How_to_use_icon.svg/2214px-How_to_use_icon.svg.png"
}
