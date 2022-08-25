import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { indexOf, isEqual, uniqBy } from "lodash"
import { Literal as L, Static, Union } from "runtypes"
import { authChanged } from "../auth/redux"
import {
  Bill,
  DraftTestimony,
  maxTestimonyLength,
  MemberSearchIndexItem,
  Position,
  Testimony,
  UseEditTestimony,
  WorkingDraft
} from "../db"
import { Maybe } from "../db/common"

export type Service = UseEditTestimony

export const Step = Union(
  L("position"),
  L("write"),
  L("publish"),
  L("selectLegislators"),
  L("share")
)
export type Step = Static<typeof Step>
export const stepsInOrder = Step.alternatives.map(s => s.value)

export const isComplete = (current: Step, step: Step) => {
  return !!current && stepsInOrder.indexOf(current) > stepsInOrder.indexOf(step)
}

export type Legislator = MemberSearchIndexItem & {
  Branch: "House" | "Senate"
  callout?: string
}

export type Errors = {
  position?: string
  content?: string
}

/** Syncs form values to the draft in firestore. */
export type SyncState = "error" | "unsaved" | "loading" | "synced"

export type State = {
  /** A bit of a hack to share the UseEditTestimony hook instance across the form */
  service?: Service

  /** Currently logged in user, author of the testimony */
  authorUid?: string

  /** Current bill */
  bill?: Bill

  /** Current step in the testimony form */
  step: Step

  /** position on the bill */
  position?: Position

  /** testimony content or description with attachment */
  content?: string

  /** ID of storage object for the attachment */
  attachmentId?: string

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

export type ShareState = {
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
    showThankYou: false,
    share: initialShareState,
    sync: "loading",
    step: "position"
  }

export const {
  reducer,
  actions: {
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
    setSyncState,
    bindService,
    setBill
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
    bindService(state, action: PayloadAction<Service | undefined>) {
      state.service = action.payload
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
      state.position = action.payload ?? undefined
      validateForm(state)
    },
    setContent(state, action: PayloadAction<Maybe<string>>) {
      state.content = action.payload ?? undefined
      validateForm(state)
    },
    setAttachmentId(state, action: PayloadAction<Maybe<string>>) {
      state.attachmentId = action.payload ?? undefined
    },
    // Reset the form whenever the bill changes
    setBill(state, action: PayloadAction<Bill>) {
      const bill = action.payload
      if (isEqual(state.bill, bill)) return state
      return resetForm({ ...state, bill })
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
      validateForm(state)
    },
    setSyncState(state, action: PayloadAction<SyncState>) {
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
  },
  extraReducers: builder => {
    // Reset the form whenever the authenticated user changes
    builder.addCase(authChanged, (state, action) => {
      const authorUid = action.payload.user?.uid
      if (state.authorUid === authorUid) return state
      return resetForm({ ...state, authorUid })
    })
  }
})

/** Check form for errors */
const validateForm = ({ content, position, errors }: State) => {
  const validated = Position.validate(position)
  if (!validated.success) errors.position = "Invalid position"
  else errors.position = undefined

  if (!content) errors.content = "Testimony content must not be empty"
  else if (content && content.length > maxTestimonyLength)
    errors.content = "Testimony content is too long"
  else errors.content = undefined
}

/** Reset the form, carrying over context props */
const resetForm = (state: State) => ({
  ...initialState,
  bill: state.bill,
  authorUid: state.authorUid,
  service: state.service
})
