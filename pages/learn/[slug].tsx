import { useRouter } from "next/router"
import { createPage } from "../../components/page"
import {
  Basics,
  Role,
  Write
} from "../../components/LearnTestimonyComponents/LearnComponents"
import Tabs from "../../components/Tabs/Tabs"

type TabsType = {
  label: string
  slug: string
  index: number
  Component: React.FC<{}>
}

const tabs: TabsType[] = [
  {
    label: "The Basics of Testimony",
    slug: 'basics-of-testimony',
    index: 1,
    Component: Basics
  },
  {
    label: "The Role of Testimony",
    slug: 'role-of-testimony',
    index: 2,
    Component: Role
  },
  {
    label: "Writing Effective Testimony",
    slug: 'writing-effective-testimony',
    index: 3,
    Component: Write
  }
]

export default createPage({
  title: "Learn",
  Page: () => {
    const router = useRouter()
    const slug = (router.query.slug as string) || ''

    const [selectedTab] = tabs.filter( t => t.slug === slug )

    return (
      <Tabs
        selectedTab={selectedTab?.index}
        onClick={(index: number) => {
          const [indexedTab] = tabs.filter( t => t.index === index )
          if (indexedTab !== selectedTab) {
            router.push(`/learn/${indexedTab.slug}`)
          }
        }}
        tabs={tabs} />
    )
  }
})
