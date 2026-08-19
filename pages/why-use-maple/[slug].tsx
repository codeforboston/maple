import { useRouter } from "next/router"
import { createPage } from "../../components/page"
import WhyUseMaple, { PERSONAS } from "components/learn/WhyUseMaple/WhyUseMaple"
import { GetStaticPaths, GetStaticProps } from "next/types"
import { ParsedUrlQuery } from "querystring"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

type Props = {
  slug: string
}

interface IParams extends ParsedUrlQuery {
  slug: string
}

export default createPage<{ params: IParams }>({
  titleI18nKey: "titles.why_use_maple",
  Page: props => {
    const router = useRouter()

    // After a shallow navigation `props.params` is stale, so read the live
    // route. It falls back to the build-time param for the first render.
    const slug =
      (router.query.slug as string | undefined) ?? (props.params as Props).slug

    // Each persona keeps its own URL, so all three stay independently linkable
    // and server-render with the right persona selected.
    //
    // The push is shallow: getStaticProps already loads all three persona
    // namespaces for every slug, so re-fetching `/_next/data/<slug>.json` on
    // each click would buy nothing and just add latency.
    return (
      <WhyUseMaple
        slug={slug}
        onSelect={next => {
          if (next !== slug)
            router.push(`/why-use-maple/${next}`, undefined, { shallow: true })
        }}
      />
    )
  }
})

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: PERSONAS.map(p => ({ params: { slug: p.slug } })),
    // { fallback: false } means other routes should 404
    fallback: false
  }
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
        "learn",
        "forindividuals",
        "forlegislators",
        "fororgs"
      ]))
    }
  }
}
