import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { skipToken } from "@reduxjs/toolkit/dist/query"
import { Bill, Profile, Testimony } from "components/db"
import { api, ApiResponse, DbService, TestimonyQuery } from "components/db/api"
import { createAppSelector, useAppSelector } from "components/hooks"
import { check, useParams } from "components/utils"
import { first, nth } from "lodash"

export type TestimonyDetailState = {
  data: PageData
  selectedVersion: number
  authorUid: string
  billId: string
  court: number
}

export type State = { currentDetails?: TestimonyDetailState }

const initialState: State = {}

export const slice = createSlice({
  name: "testimonyDetail",
  initialState,
  reducers: {
    versionSelected({ currentDetails }, action: PayloadAction<number>) {
      currentDetails!.selectedVersion = action.payload
    }
  },
  extraReducers: builder => {
    builder.addMatcher(
      endpoints.testimonyDetailPageData.matchFulfilled,
      (state, action) => {
        const data = action.payload,
          { authorUid, billId, court, version } = action.meta.arg.originalArgs

        let selected = check(first(data.archive))
        if (version) {
          const s = data.archive.find(a => a.version === version)
          if (s) selected = s
        }

        state.currentDetails = {
          data,
          authorUid,
          billId,
          court,
          selectedVersion: selected!.version
        }
      }
    )
  }
})

export const {
  actions: { versionSelected }
} = slice

const db = new DbService()

export type PageData = {
  testimony?: Testimony
  bill: Bill
  author?: Profile & { uid: string }
  /** Archived testimony, in descending version order */
  archive: Testimony[]
}

export type PageQuery = TestimonyQuery & { version?: number }

const { useTestimonyDetailPageDataQuery, endpoints } = api.injectEndpoints({
  endpoints: builder => ({
    testimonyDetailPageData: builder.query<PageData, PageQuery>({
      queryFn: async args => {
        const testimony = await db.getPublishedTestimony(args),
          bill = await db.getBill({ billId: args.billId, court: args.court }),
          author = await db.getProfile({ uid: args.authorUid }),
          archive = await db.getArchivedTestimony(args)

        if (!bill) return ApiResponse.notFound("Bill not found")
        if (!archive)
          return ApiResponse.notFound("Archived testimony not found")
        const data: PageData = { testimony, bill, author, archive }
        return ApiResponse.ok(data)
      }
    })
  })
})

export const selectTestimonyDetails = createAppSelector(
  ({ testimonyDetail }) => {
    const {
      data: { archive, bill, author },
      selectedVersion,
      ...rest
    } = check(testimonyDetail.currentDetails)
    const revisions = calculateRevisions(archive)
    const revision = check(revisions.find(r => r.version === selectedVersion))

    return {
      revisions,
      revision,
      authorNickname: author?.displayName ?? revision.authorDisplayName,
      authorTitle: author?.fullName ?? revision.authorDisplayName,
      authorLink: author && `/profile?id=${author.uid}`,
      isEdited: revision.version > 1,
      bill,
      author,
      version: revision.version,
      ...rest
    }
  }
)

export type Revision = Testimony & {
  previous?: Testimony
  changes: {
    new: boolean
    position: boolean
    content: boolean
    attachment: boolean
  }
}

const calculateRevisions = (archive: Testimony[]): Revision[] => {
  return archive.map((current, i, m) => {
    const previous = nth(m, i + 1)

    return {
      ...current,
      previous,
      changes: {
        new: current.version === 1,
        attachment: current.attachmentId !== previous?.attachmentId,
        content: current.content !== previous?.content,
        position: current.position !== previous?.position
      }
    }
  })
}

export const useCurrentTestimonyDetails = () =>
  useAppSelector(selectTestimonyDetails)

export const useFetchPageData = () => {
  const params = usePageParams()
  return useTestimonyDetailPageDataQuery(params ?? skipToken)
}

export const usePageParams = () => {
  return useParams()(p => {
    const required = p.all({
      billId: p.string("billId"),
      authorUid: p.string("author"),
      court: p.number("court")
    })

    if (required)
      return {
        ...required,
        currentVersion: p.number("version")
      }
  })
}
