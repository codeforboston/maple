import { dbService } from "components/db/api"
import { GetServerSideProps } from "next"
import { z } from "zod"
import { BillDetails } from "../../../components/bill"
import { Bill } from "../../../components/db"
import { createPage } from "../../../components/page"
import { usePublishService } from "../../../components/publish/hooks"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

const Query = z.object({ court: z.coerce.number(), billId: z.string({}) })

export default createPage<{ bill: Bill }>({
  title: "Bill",
  Page: ({ bill }) => {
    return (
      <>
        <usePublishService.Provider />
        <BillDetails bill={bill} />
      </>
    )
  }
})

export const getServerSideProps: GetServerSideProps = async ctx => {
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  )

  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"

  const query = Query.safeParse(ctx.query)
  if (!query.success) return { notFound: true }

  const dbsStart = performance.now()
  const dbs = dbService()
  const dbsEnd = performance.now()
  console.log("Getting dbService took", dbsEnd - dbsStart, "ms")

  const billStart = performance.now()
  const bill = await dbs.getBill(query.data)
  const billEnd = performance.now()
  console.log("Getting bill took", billEnd - billStart, "ms")

  if (!bill) return { notFound: true }

  const translationsStart = performance.now()
  const translations = await serverSideTranslations(locale, [
    "auth",
    "common",
    "footer",
    "testimony",
    "profile"
  ])
  const translationsEnd = performance.now()
  console.log(
    "Getting translations took",
    translationsEnd - translationsStart,
    "ms"
  )

  return {
    props: {
      bill: JSON.parse(JSON.stringify(bill)),
      ...translations
    }
  }
}
