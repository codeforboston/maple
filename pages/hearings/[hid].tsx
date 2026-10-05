import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { z } from "zod"
import { createPage } from "../../components/page"
import { DDHearingDetails } from "components/hearing/DDHearingDetails"
import {
  DDHearing,
  fetchDDHearing
} from "components/hearing/digitalDemocracyApi"

const Query = z.object({ hid: z.coerce.number() })

export default createPage<{ hearing: DDHearing }>({
  titleI18nKey: "navigation.hearing",
  Page: ({ hearing }) => {
    return <DDHearingDetails hearing={hearing} />
  }
})

export const getServerSideProps: GetServerSideProps = async ctx => {
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=3600"
  )

  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"

  const query = Query.safeParse(ctx.query)
  if (!query.success) return { notFound: true }

  const hearing = await fetchDDHearing(query.data.hid)
  if (!hearing) return { notFound: true }

  return {
    props: {
      hearing,
      ...(await serverSideTranslations(locale, [
        "auth",
        "common",
        "footer",
        "hearing"
      ]))
    }
  }
}
