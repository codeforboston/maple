import { useRouter } from "next/router"
import { createPage } from "../../components/page"
import {
  Basics,
  Role,
  Write,
  CommunicatingWithLegislators
} from "../../components/LearnTestimonyComponents/LearnComponents"
import Tabs from "../../components/Tabs/Tabs"
import { GetStaticPaths, GetStaticProps } from "next/types"
import { ParsedUrlQuery } from "querystring"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

type TabsType = {
  label: string
  slug: string
  index: number
  Component: React.FC<{}>
}

type Props = {
  slug: string
}

interface IParams extends ParsedUrlQuery {
  slug: string
}

const tabs: TabsType[] = [
  {
    label: "Testimony Basics",
    slug: "testimony-basics",
    index: 1,
    Component: Basics
  },
  {
    label: "The Role of Testimony",
    slug: "role-of-testimony",
    index: 2,
    Component: Role
  },
  {
    label: "Writing Effective Testimony",
    slug: "writing-effective-testimony",
    index: 3,
    Component: Write
  },
  {
    label: "Communicating with Legislators",
    slug: "communicating-with-legislators",
    index: 4,
    Component: CommunicatingWithLegislators
  }
]

export default createPage<{ params: IParams }>({
  titleI18nKey: "learn",
  Page: props => {
    const router = useRouter()

    const { slug } = props.params as Props

    const [selectedTab] = tabs.filter(t => t.slug === slug)

    return (
      <Tabs
        selectedTab={selectedTab?.index}
        onClick={(index: number) => {
          const [indexedTab] = tabs.filter(t => t.index === index)
          if (indexedTab !== selectedTab) {
            router.push(`/learn/${indexedTab.slug}`)
          }
        }}
        tabs={tabs}
      />
    )
  }
})

export const getStaticPaths: GetStaticPaths = async () => {
  // Get the paths we want to prerender based on posts
  // In production environments, prerender all pages
  // (slower builds, but faster initial page load)
  const paths = tabs.map(tab => ({
    params: { slug: tab.slug }
  }))

  // { fallback: false } means other routes should 404
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async context => {
  const params = context.params as IParams
  const locale = context.locale ?? context.defaultLocale ?? "en"

  return {
    props: {
      params,
      ...(await serverSideTranslations(locale, [
        "auth",
        "common",
        "footer",
        "testimony",
        "learnComponents"
      ]))
    }
  }
}
