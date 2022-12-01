import { ComponentStory } from "@storybook/react"
import React, { useState } from "react"
import { createMeta } from "stories/utils"
import { AlertCard } from "components/dashboard/AlertCard"


export default createMeta({ 
  title: "Dashboard/Newsfeed/AlertCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=158%3A2873",
  component: AlertCard
})

const Template: ComponentStory<typeof AlertCard> = props => {
  return <AlertCard {...props} />
}

export const Primary = Template.bind({})
Primary.args = {
  header: "This is an alert title",
  subheader: "this is the subeheader", 
  timestamp: "This is a timestamp", 
  headerImgSrc:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/How_to_use_icon.svg/2214px-How_to_use_icon.svg.png", 
  bodyImgSrc:"",
  bodyText: "This is the bodyText"
} 