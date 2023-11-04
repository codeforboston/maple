import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Bill, Profile, Testimony } from "components/db"
import { TestimonyQuery } from "components/db/api"
import { createAppSelector, useAppSelector } from "components/hooks"
import { check } from "components/utils"
import { maxBy, nth } from "lodash"
import { HYDRATE } from "next-redux-wrapper"

export type PageQuery = TestimonyQuery & { version?: number }

export type PageData = {
  testimony: Testimony
  bill: Bill
  author: (Profile & { uid: string }) | null
  /** Archived testimony, in descending version order */
  archive: Testimony[]
  version: number
}

export type TestimonyDetailState = {
  data: PageData
  selectedVersion: number
  authorUid: string
  billId: string
  court: number
}

const initialState: TestimonyDetailState = {} as any

export const slice = createSlice({
  name: "testimonyDetail",
  initialState,
  reducers: {
    pageDataLoaded(_, action: PayloadAction<PageData>) {
      const data = action.payload,
        selected = check(data.archive.find(a => a.version === data.version))
      return {
        data,
        selectedVersion: data.version,
        authorUid: selected.authorUid,
        billId: selected.billId,
        court: selected.court
      }
    },
    versionSelected(state, action: PayloadAction<number>) {
      state.selectedVersion = action.payload
    }
  },
  extraReducers: {
    [HYDRATE]: (state, action) => {
      Object.assign(state, action.payload[slice.name])
    }
  }
})

export const {
  actions: { versionSelected, pageDataLoaded }
} = slice

const selectTestimonyDetails = createAppSelector(({ testimonyDetail }) => {
  const {
    data: { archive, bill, author, testimony },
    selectedVersion,
    ...rest
  } = check(testimonyDetail)
  const revisions = calculateRevisions(archive)
  const revision = check(revisions.find(r => r.version === selectedVersion))

  return {
    revisions,
    revision,
    authorTitle: testimony.fullName ?? "Anonymous",
    authorLink: author && `/profile?id=${author.uid}`,
    isEdited: revision.version > 1,
    bill,
    author,
    publishedId: testimony.id,
    version: revision.version,
    currentVersion: testimony.version,
    isCurrentVersion: revision.version === testimony.version,
    ...rest
  }
})

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
