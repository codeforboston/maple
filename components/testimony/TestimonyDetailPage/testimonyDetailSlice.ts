import { skipToken } from "@reduxjs/toolkit/dist/query"
import { Bill, Profile, Testimony } from "components/db"
import { api, ApiResponse, DbService, TestimonyQuery } from "components/db/api"
import { useAppSelector } from "components/hooks"
import { check, useParams } from "components/utils"
import { useMemo } from "react"

const db = new DbService()

export type PageData = {
  testimony: Testimony
  bill: Bill
  author?: Profile & { uid: string }
  /** Archived testimony, in descending version order */
  archive: Testimony[]
}

export const { useTestimonyDetailPageDataQuery, endpoints } =
  api.injectEndpoints({
    endpoints: builder => ({
      testimonyDetailPageData: builder.query<PageData, TestimonyQuery>({
        queryFn: async args => {
          const testimony = await db.getPublishedTestimony(args),
            bill = await db.getBill({ billId: args.billId, court: args.court }),
            author = await db.getProfile({ uid: args.authorUid }),
            archive = await db.getArchivedTestimony(args)

          if (!testimony) return ApiResponse.notFound("Testimony not found")
          if (!bill) return ApiResponse.notFound("Bill not found")
          if (!archive)
            return ApiResponse.notFound("Archived testimony not found")
          return ApiResponse.ok({ testimony, bill, author, archive })
        }
      })
    })
  })

/** Get the already-fetched testimony details. This throws an error if data is
 * not already available. It should only be called from inside the testimony
 * detail page. */
export const useTestimonyDetails = () => {
  const params = usePageParams()
  const selector = useMemo(
    () => endpoints.testimonyDetailPageData.select(params),
    [params]
  )
  return check(useAppSelector(selector).data)
}

export const useFetchPageData = () => {
  const params = usePageParams()
  return useTestimonyDetailPageDataQuery(params)
}

export const usePageParams = () => {
  return useParams()(
    p =>
      p.all({
        billId: p.string("billId"),
        authorUid: p.string("author"),
        court: p.number("court") ?? 192
      }) ?? skipToken
  )
}
