import { Bill, Profile, Testimony } from "components/db"
import { api, DbService, TestimonyQuery } from "components/db/api"

const db = new DbService()

export type PageData = {
  testimony: Testimony
  bill: Bill
  author?: Profile & { uid: string }
}

export const { useTestimonyDetailPageDataQuery, endpoints } =
  api.injectEndpoints({
    endpoints: builder => ({
      testimonyDetailPageData: builder.query<PageData, TestimonyQuery>({
        queryFn: async (args, api) => {
          const testimony = await db.getPublishedTestimony(args),
            bill = await db.getBill({ billId: args.billId, court: args.court }),
            author = await db.getPublicProfile({ uid: args.authorUid })

          if (!testimony)
            return { error: { status: 404, data: "Testimony not found" } }
          if (!bill) return { error: { status: 404, data: "Bill not found" } }
          return { data: { testimony, bill, author } }
        }
      })
    })
  })

export const useTestimonyDetails = () => {}
