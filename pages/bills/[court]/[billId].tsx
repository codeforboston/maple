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

  const locale = ctx.locale as string

  const query = Query.safeParse(ctx.query)
  if (!query.success) return { notFound: true }
  const bill = await dbService().getBill(query.data)
  if (!bill) return { notFound: true }
  return {
    props: {
      bill: JSON.parse(JSON.stringify(bill)),
      ...(await serverSideTranslations(locale, ["common", "footer"]))
    }
  }
}
