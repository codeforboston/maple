import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { createAppThunk } from "components/hooks"
import { indexOf, isEqual, uniqBy } from "lodash"
import { Literal as L, Static, Union } from "runtypes"
import { authChanged } from "../auth/redux"
import { getPublishMode } from "./mode"
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
import { containsSocialSecurityNumber } from "../db/testimony/validation"
import { hasDraftChanged } from "../db/testimony"

export type Service = UseEditTestimony

export const Step = Union(
  L("position"),
  L("selectLegislators"),
  L("write"),
  L("publish"),
  L("share")
)
export type Step = Static<typeof Step>
export const stepsInOrder = Step.alternatives.map(s => s.value)
export const ballotQuestionStepsInOrder: Step[] = [
  "position",
  "write",
  "publish"
]

const stepsInOrderForState = ({
  ballotQuestionId
}: Pick<State, "ballotQuestionId">) =>
  getPublishMode(ballotQuestionId) === "ballotQuestion"
    ? ballotQuestionStepsInOrder
    : stepsInOrder

export const isComplete = (current: Step, step: Step) => {
  return !!current && stepsInOrder.indexOf(current) > stepsInOrder.indexOf(step)
}
export const isCurrent = (current: Step, step: Step) => current === step

export type Legislator = MemberSearchIndexItem & {
  Branch: "House" | "Senate"
  callout?: string
}

export type Errors = {
  position?: string
  content?: string
  editReason?: string
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

  /** Current ballot question ID (for ballot question testimony) */
  ballotQuestionId?: string

  /** Current step in the testimony form */
  step: Step

  /** position on the bill */
  position?: Position

  /** testimony content or description with attachment */
  content?: string

  /** ID of storage object for the attachment */
  attachmentId?: string

  /** Reason for editing the testimony */
  editReason?: string

  /** Form validation errors */
  errors: Errors

  /** Current draft document. As the user updates the form, we sync the above
   * fields to the draft document, which gets reflected here. */
  draft?: Partial<DraftTestimony>

  /** Current publication document */
  publication?: Testimony

  /** Member codes of legislators that will receive the email, stored on the draft. */
  recipientMemberCodes?: string[]

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
    resolvedLegislatorSearch,
    clearLegislatorSearch,
    addCommittee,
    removeCommittee,
    addMyLegislators,
    removeMyLegislators,
    setEditReason,
    setRecipients,
    setShowThankYou,
    setContent,
    setAttachmentId,
    setPublicationInfo,
    setSyncState,
    bindService,
    setBill,
    setBallotQuestionId
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
      validateForm(state)
    },
    setPosition(state, action: PayloadAction<Maybe<Position>>) {
      state.position = action.payload ?? undefined
      validateForm(state)
    },
    setContent(state, action: PayloadAction<Maybe<string>>) {
      state.content = action.payload ?? undefined
      validateForm(state)
    },
    setEditReason(state, action: PayloadAction<Maybe<string>>) {
      state.editReason = action.payload ?? undefined
      validateForm(state)
    },
    setAttachmentId(state, action: PayloadAction<Maybe<string>>) {
      state.attachmentId = action.payload ?? undefined
      validateForm(state)
    },
    // Reset the form whenever the bill changes
    setBill(state, action: PayloadAction<Bill>) {
      const bill = action.payload
      if (isEqual(state.bill, bill)) return state
      return resetForm({ ...state, bill })
    },
    setBallotQuestionId(state, action: PayloadAction<string | undefined>) {
      state.ballotQuestionId = action.payload
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
      state.recipientMemberCodes = payload.recipientMemberCodes ?? undefined
      state.editReason = payload.editReason ?? undefined
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
      validateForm(state)
    },
    clearLegislatorSearch(state) {
      state.share = initialShareState
    },
    resolvedLegislatorSearch(
      state,
      {
        payload
      }: PayloadAction<
        Pick<ShareState, "committeeChairs" | "options" | "userLegislators">
      >
    ) {
      const { share } = state
      share.loading = false
      share.committeeChairs = payload.committeeChairs
      share.options = payload.options
      share.userLegislators = payload.userLegislators
      // Auto-populate recipients if they haven't been set yet and the user is not
      // editing existing testimony.
      if (!state.recipientMemberCodes && !state.publication)
        updateRecipients(state, [
          ...payload.committeeChairs,
          ...payload.userLegislators
        ])
      else
        share.recipients = share.options.filter(o =>
          state.recipientMemberCodes?.includes(o.MemberCode)
        )
    },
    setRecipients(state, action: PayloadAction<Legislator[]>) {
      updateRecipients(state, action.payload)
    },
    addCommittee(state) {
      const { share } = state
      updateRecipients(
        state,
        uniqBy(
          [...share.recipients, ...share.committeeChairs],
          m => m.MemberCode
        )
      )
    },
    removeCommittee(state) {
      const { share } = state
      const idsToRemove = share.committeeChairs.map(item => item.MemberCode)
      updateRecipients(
        state,
        share.recipients.filter(m => !idsToRemove.includes(m.MemberCode))
      )
    },
    addMyLegislators(state) {
      const { share } = state
      updateRecipients(
        state,
        uniqBy(
          [...share.recipients, ...share.userLegislators],
          m => m.MemberCode
        )
      )
    },
    removeMyLegislators(state) {
      const { share } = state
      const idsToRemove = share.userLegislators.map(item => item.MemberCode)
      updateRecipients(
        state,
        share.recipients.filter(m => !idsToRemove.includes(m.MemberCode))
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

const updateRecipients = (state: State, recipients: Legislator[]) => {
  state.share.recipients = recipients
  state.recipientMemberCodes = recipients.map(r => r.MemberCode)
}

/** Check form for errors */
const validateForm = ({
  content,
  position,
  editReason,
  publication,
  draft,
  errors,
  ballotQuestionId
}: State) => {
  const isBallotQuestion = Boolean(ballotQuestionId)
  const contentNoun = isBallotQuestion ? "Perspective" : "Testimony"
  const editNoun = isBallotQuestion ? "perspective" : "testimony"
  const validated = Position.validate(position)
  if (!validated.success) errors.position = "Invalid position"
  else errors.position = undefined

  if (!content) errors.content = `${contentNoun} content must not be empty`
  else if (content && content.length > maxTestimonyLength)
    errors.content = `${contentNoun} content is too long`
  else if (containsSocialSecurityNumber(content)) {
    // TODO: include the offending number(s) in the error string.
    errors.content = `${contentNoun} must not contain social security numbers`
  } else errors.content = undefined

  if (hasDraftChanged(draft, publication) && !editReason)
    errors.editReason = `You must provide a reason for editing your ${editNoun}`
  else errors.editReason = undefined
}

/** Reset the form, carrying over context props */
const resetForm = (state: State) => ({
  ...initialState,
  bill: state.bill,
  ballotQuestionId: state.ballotQuestionId,
  authorUid: state.authorUid,
  service: state.service
})

export const nextStep = createAppThunk("publish/nextStep", async (_, api) => {
  const {
    profile: { profile },
    publish
  } = api.getState()
  const { step } = publish
  const hasLegislators = Boolean(profile?.representative && profile.senator)
  const orderedSteps = stepsInOrderForState(publish)

  let i = indexOf(orderedSteps, step)
  let nextStep = i !== -1 && orderedSteps[i + 1]

  if (nextStep === "selectLegislators" && hasLegislators)
    nextStep = orderedSteps[i + 2]

  if (nextStep) api.dispatch(setStep(nextStep))
})

export const previousStep = createAppThunk(
  "publish/previousStep",
  async (_, api) => {
    const {
      profile: { profile },
      publish
    } = api.getState()
    const { step } = publish
    const hasLegislators = Boolean(profile?.representative && profile.senator)
    const orderedSteps = stepsInOrderForState(publish)

    let i = indexOf(orderedSteps, step)
    let nextStep = orderedSteps[i - 1]

    if (nextStep === "selectLegislators" && hasLegislators)
      nextStep = orderedSteps[i - 2]

    if (nextStep) api.dispatch(setStep(nextStep))
  }
)
