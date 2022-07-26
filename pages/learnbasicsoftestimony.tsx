import { useState } from "react"
import { createPage } from "../components/page"
import Tabs from "../components/Tabs/Tabs"
import {
  Basics,
  Role,
  Write
} from "../components/LearnTestimonyComponents/LearnComponents"

type TabsType = {
  label: string
  index: number
  Component: React.FC<{}>
}[]

// Tabs Array
const tabs: TabsType = [
  {
    label: "The Basics of Testimony",
    index: 1,
    Component: Basics
  },
  {
    label: "The Role of Testimony",
    index: 2,
    Component: Role
  },
  {
    label: "Writing Effective Testimony",
    index: 3,
    Component: Write
  }
]

export default createPage({
  title: "Learn About Testimony",
  Page: () => {
    const [selectedTab, setSelectedTab] = useState<number>(tabs[0].index)

    return (
      <Tabs selectedTab={selectedTab} onClick={setSelectedTab} tabs={tabs} />
    )
  }
})
