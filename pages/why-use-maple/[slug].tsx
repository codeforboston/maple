import { useRouter } from "next/router"
import { createPage } from "../../components/page"
import ForIndividuals from "../../components/about/ForIndividuals/ForIndividuals"
import ForOrgs from "../../components/about/ForOrgs/ForOrgs"
import ForLegislators from "../../components/about/ForLegislators/ForLegislators"
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
    label: "For Individuals",
    slug: "for-individuals",
    index: 1,
    Component: ForIndividuals
  },
  {
    label: "For Organizations",
    slug: "for-orgs",
    index: 2,
    Component: ForOrgs
  },
  {
    label: "For Legislators",
    slug: "for-legislators",
    index: 3,
    Component: ForLegislators
  }
]

export default createPage<{ params: IParams }>({
  title: "Why Use Maple?",
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
            router.push(`/why-use-maple/${indexedTab.slug}`)
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
        "forindividuals",
        "forlegislators",
        "fororgs"
      ]))
    }
  }
}
