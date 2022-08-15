import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { indexOf, uniqBy } from "lodash"
import {
  Bill,
  DraftTestimony,
  MemberSearchIndexItem,
  Position,
  Testimony,
  WorkingDraft
} from "../db"
import { currentGeneralCourt, Maybe } from "../db/common"
import { useAppSelector } from "../hooks"

export const stepsInOrder = [
  "position",
  "write",
  "publish",
  "selectLegislators",
  "share"
] as const
export type Step = typeof stepsInOrder[number]

export const isComplete = (current: Step | undefined, step: Step) => {
  return !!current && stepsInOrder.indexOf(current) > stepsInOrder.indexOf(step)
}

export type Legislator = MemberSearchIndexItem & {
  Branch: "House" | "Senate"
  callout?: string
}

type Errors = {
  position?: string
  content?: string
  attachmentId?: string
}

/** Syncs form values to the draft in firestore. */
export type SyncState = "empty" | "unsaved" | "loading" | "synced"

export type State = {
  /** Current step in the testimony form */
  step?: Step

  /** Currently logged in user, author of the testimony */
  authorUid?: string

  /** Current general court  */
  court?: number

  /** Current bill */
  bill?: Bill

  /** position on the bill */
  position?: Position

  /** testimony content or description with attachment */
  content?: string

  /** ID of storage object for the attachment */
  attachmentId?: string

  // /** Document version of the published testimony that matches this draft. If
  //  * this is undefined, there are unpublished changes. */
  // publishedVersion?: number

  /** Form validation errors */
  errors: Errors

  /** Current draft document. As the user updates the form, we sync the above
   * fields to the draft document, which gets reflected here. */
  draft?: Partial<DraftTestimony>

  /** Current publication document */
  publication?: Testimony

  /** State related to the share step */
  share: ShareState

  /** Whether to show the thank you modal */
  showThankYou: boolean

  /** State of cloud syncing */
  sync: SyncState
}

type ShareState = {
  loading: boolean
  recipients: Legislator[]
  userLegislators: Legislator[]
  committeeChairs: Legislator[]
  options: Legislator[]
}

const initialShareState: ShareState = {
    loading: true,
    recipients: [],
    options: [],
    userLegislators: [],
    committeeChairs: []
  },
  initialState: State = {
    errors: {},
    court: currentGeneralCourt,
    showThankYou: false,
    share: initialShareState,
    sync: "empty"
  }

export const {
  reducer,
  actions: {
    signedOut,
    restoreFromDraft,
    syncTestimony,
    setStep,
    setPosition,
    nextStep,
    previousStep,
    resolvedLegislatorSearch,
    clearLegislatorSearch,
    addCommittee,
    addMyLegislators,
    setRecipients,
    setShowThankYou,
    setContent,
    setAttachmentId,
    setPublicationInfo,
    setSync
  }
} = createSlice({
  name: "publish",
  initialState,
  reducers: {
    /*
      - users navigate between the bill detail page and each step of the
        testimony submission form. 
      - We automatically sync form inputs with the draft document in firebase.
      - Form inputs are validated after each change and when navigating between
        pages.
      - inputs display errors
      - pages display when they are saving and disallow navigation while saving.
        Displays errors.
      - Steps: position, write, publish, selectLegislators, share.
        - position: any time.
        - write: any time. if position not set, redirects to position.
        - publish: any time. redirects to inputs if not set. disallows
          publishing if no change. displays any remaining draft errors
        - selectLegislators: redirects to share if set or draft if not published
        - share: redirects to selectLegislators if not set. Allows sharing
          published testimony. Displays a warning if there is an open draft.
          redirects to draft if not published
    */
    signedOut(_) {
      return initialState
    },
    setStep(state, action: PayloadAction<Step>) {
      state.step = action.payload
    },
    nextStep(state) {
      const i = indexOf(stepsInOrder, state.step)
      if (i !== -1 && i + 1 < stepsInOrder.length) {
        state.step = stepsInOrder[i + 1]
      }
    },
    previousStep(state) {
      const i = indexOf(stepsInOrder, state.step)
      if (i - 1 >= 0) {
        state.step = stepsInOrder[i - 1]
      }
    },
    setPosition(state, action: PayloadAction<Maybe<Position>>) {
      const validated = Position.validate(action.payload)
      state.position = action.payload ?? undefined
      // state.publishedVersion = undefined
      if (!validated.success) state.errors.position = validated.code
    },
    setContent(state, action: PayloadAction<Maybe<string>>) {
      const validated = Position.validate(action.payload)
      state.content = action.payload ?? undefined
      if (!validated.success) state.errors.content = validated.code
    },
    setAttachmentId(state, action: PayloadAction<Maybe<string>>) {
      state.attachmentId = action.payload ?? undefined
      // state.publishedVersion = undefined
    },
    setPublicationInfo(
      state,
      { payload: info }: PayloadAction<{ authorUid?: string; bill?: Bill }>
    ) {
      state.authorUid = info.authorUid
      state.bill = info.bill
    },
    restoreFromDraft(state, { payload }: PayloadAction<WorkingDraft>) {
      state.attachmentId = payload.attachmentId ?? undefined
      state.content = payload.content
      state.position = payload.position
      state.draft = payload
      // state.publishedVersion = payload.publishedVersion
    },
    setSync(state, action: PayloadAction<SyncState>) {
      state.sync = action.payload
    },
    /** Updates testimony state after syncing to firestore documents. */
    syncTestimony(
      state,
      action: PayloadAction<{
        draft?: Partial<DraftTestimony>
        publication?: Testimony
      }>
    ) {
      const { draft, publication } = action.payload

      state.publication = publication
      state.draft = draft
    },
    clearLegislatorSearch(state) {
      state.share = initialShareState
    },
    resolvedLegislatorSearch(
      { share },
      {
        payload
      }: PayloadAction<
        Pick<ShareState, "committeeChairs" | "options" | "userLegislators">
      >
    ) {
      share.loading = false
      share.committeeChairs = payload.committeeChairs
      share.options = payload.options
      share.userLegislators = payload.userLegislators
      share.recipients = [
        ...payload.committeeChairs,
        ...payload.userLegislators
      ]
    },
    setRecipients({ share }, action: PayloadAction<Legislator[]>) {
      share.recipients = action.payload
    },
    addCommittee({ share }) {
      share.recipients = uniqBy(
        [...share.recipients, ...share.committeeChairs],
        m => m.MemberCode
      )
    },
    addMyLegislators({ share }) {
      share.recipients = uniqBy(
        [...share.recipients, ...share.userLegislators],
        m => m.MemberCode
      )
    },
    setShowThankYou(state, action: PayloadAction<boolean>) {
      state.showThankYou = action.payload
    }
  }
})

export const usePublishState = () => useAppSelector(state => state.publish)
