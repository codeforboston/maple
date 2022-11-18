import { createMeta } from "stories/utils"
import React from "react"
import { BillSponsors } from "../../components/bill/BillSponsors"
import { ComponentStory } from "@storybook/react"

export default createMeta({
  title: "Bill Detail/BillSponsorCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=172%3A8380",
  component: BillSponsors
})

const Template: ComponentStory<typeof BillSponsors> = args => {
  return <BillSponsors {...args} />
}

export const Primary = Template.bind({})
Primary.args = {
  PrimarySponsor: [
    {
      id: 0,
      Name: "Michael Brady",
      sponsorType: "Lead Sponsor"
    }
  ],
  CoSponsors: [
    {
      id: 1,
      Name: "Jeffrey Roy",
      sponsorType: "Sponsor"
    },
    {
      id: 2,
      Name: "James J. O'Day",
      sponsorType: "Sponsor"
    },
    {
      id: 3,
      Name: "Michael D. Brady",
      sponsorType: "Sponsor"
    },
    {
      id: 4,
      Name: "Jeffrey N. Roy",
      sponsorType: "Sponsor"
    },
    {
      id: 5,
      Name: "James J. O'Day",
      sponsorType: "Sponsor"
    },
    {
      id: 6,
      Name: "Sandra Day O'Connor",
      sponsorType: "Sponsor"
    }
  ]
}
