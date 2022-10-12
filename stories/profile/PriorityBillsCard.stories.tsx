import { convertNumericRefinementsToFilters } from "instantsearch.js/es/lib/utils"
import React, { useState } from "react"
import { createMeta } from "stories/utils"
import { PriorityBillsCard } from "../../components/PriortyBillsCard/PriorityBillsCard"

//const PriorityBillsCard = () => <div>TODO</div>
//const [isATheCLickyMe, setIsATheClickyMe] = useState()

export default createMeta({
  title: "Profile/PriorityBillsCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=109%3A2927",
  component: PriorityBillsCard
})

const Template = args => <PriorityBillsCard {...args} />

export const Primary = Template.bind({})
Primary.args = {
  bills: [
    {
      id: "123",
      billNumber: "hc 508",
      title:
        "An act that will which would have wonder with have done wrought it so orth here we go!",

      approval: "y"
    },
    {
      id: "456",
      billNumber: "hc 411",
      title:
        "An act that will which would have wonder with have done wrought it so orth here we go!",

      approval: "y"
    },
    {
      id: "789",
      billNumber: "hc 999",
      title:
        "An act that will which would have wonder with have done wrought it so orth here we go!",

      approval: "y"
    },
    {
      id: "012",
      billNumber: "hc 911",
      title:
        "An act that will which would have wonder with have done wrought it so orth here we go!",

      approval: "y"
    },
    {
      id: "345",
      billNumber: "hc 888",
      title:
        "An act that will which would have wonder with have done wrought it so orth here we go!",

      approval: "y"
    }
  ],
  bill_id: "ham",

  color: "white",
  backgroundColor: "#1a3185",
  borderTop: "solid white 1px",
  width: "254px",
  height: "79px",
  padding: "0px 0px 15px 0px",
  marginTop: "0px",
  marginBottom: "0px",
  margin: "0px",
  fontWeight: "600px",
  lineHeight: "15px",
  letterSpacing: "3%",
  fontSize: "12px",
  callBack: () => console.log("yo")
}

export const Selected = Template.bind({})
Selected.args = {
  bills: [
    {
      id: "123",
      billNumber: "hc 223",
      title:
        "An act that will which would have wonder with have done wrought it so orth here we go!",

      approval: "y"
    },
    {
      id: "123",
      billNumber: "hc 223",
      title:
        "An act that will which would have wonder with have done wrought it so orth here we go!",

      approval: "y"
    },
    {
      id: "123",
      billNumber: "hc 223",
      title:
        "An act that will which would have wonder with have done wrought it so orth here we go!",

      approval: "y"
    }
  ],
  bill_id: "ham",
  borderTop: "solid white 1px",
  width: "254px",
  height: "79px",
  padding: "0px 0px 15px 0px",
  marginTop: "0px",
  marginBottom: "0px",
  margin: "0px",
  fontWeight: "600px",
  lineHeight: "15px",
  letterSpacing: "3%",
  fontSize: "12px",
  callBack: "check"
}
