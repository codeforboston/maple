import { ComponentStory } from "@storybook/react"
import React, { useState } from "react"
import { createMeta } from "stories/utils"
import { NewsfeedCard } from "components/NewsfeedCard/NewsfeedCard"
import { Timestamp } from "common/types"

export default createMeta({
  title: "Dashboard/Newsfeed/NewsfeedCard",
  component: NewsfeedCard
})

const Template: ComponentStory<typeof NewsfeedCard> = props => {
  return <NewsfeedCard {...props} />
}

export const OrgWithBodyImage = Template.bind({})
OrgWithBodyImage.args = {
  header: "Cool Organization",
  subheader: "Our Priority Bills",
  timestamp: Timestamp.fromDate(new Date("2021-10-10T22:02:00")),
  // headerImgSrc:
  //   "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/How_to_use_icon.svg/2214px-How_to_use_icon.svg.png",
  // bodyImgSrc:
  //   "https://regulatorystudies.columbian.gwu.edu/sites/g/files/zaxdzs4751/files/image/United_States_Capitol_-_west_front_small.jpg",
  bodyText:
    "Come to our FAQ Session held at plaza on 248 Willow Street in Watertown, MA! There will be light refreshments and snacks."
}

export const OrgWithNoBodyImage = Template.bind({})
OrgWithNoBodyImage.args = {
  header: "Moms for Liberty",
  // headerImgSrc:
  //   "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/How_to_use_icon.svg/2214px-How_to_use_icon.svg.png",
  timestamp: Timestamp.fromDate(new Date("2021-10-10T22:02:00")),
  bodyText: "Moms for Liberty released a testimony on S.1958"
}

export const BillWithBodyImage = Template.bind({})
BillWithBodyImage.args = {
  header: "Bill H.1321",
  subheader: "An Act to do something cool",
  timestamp: Timestamp.fromDate(new Date("2021-10-10T06:00:00")),
  // bodyImgSrc:
  //   "https://regulatorystudies.columbian.gwu.edu/sites/g/files/zaxdzs4751/files/image/United_States_Capitol_-_west_front_small.jpg",
  bodyText: "Bill moved on in deliberations with some group"
}

export const BillWithSubheader = Template.bind({})
BillWithSubheader.args = {
  header: "Bill H.3340",
  subheader:
    "An Act creating a green bank to promote clean energy in Massachusetts",
  timestamp: Timestamp.fromDate(new Date("2021-10-10T15:20:00")),
  bodyText:
    "The reporting date was extended to Thursday June 30, 2022, pending concurrence"
}

export const BillWithNoSubheader = Template.bind({})
BillWithNoSubheader.args = {
  header: "Bille H.2241",
  timestamp: Timestamp.fromDate(new Date("2021-10-10T22:05:00")),
  bodyText: "Senate concurred"
}
