import {
  ComponentProps,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState
} from "react"
import { Timestamp } from "firebase/firestore"
import { Trans, useTranslation } from "next-i18next"
import styled, { keyframes } from "styled-components"
import { useAuth } from "components/auth"
import { LoadingButton } from "components/buttons"
import {
  ConferencePosition,
  ConferenceTestimony,
  hasDraftChanged,
  Testimony,
  UseEditConferenceTestimony,
  useProfile,
  WorkingDraft
} from "components/db"
import { Internal } from "components/links"
import { FULL_LAYOUT, SHEET_SPREAD } from "../styles"
import type { ConfereeView } from "../types"
import {
  CountsOnce,
  LetterReview,
  NoLine,
  OnRecord,
  SitePreview
} from "./Review"
import { conferencePositions, positionColours } from "./positions"
import { brand, ink, line, red, wash } from "./tokens"
import { usePost } from "./usePost"

/** The panel's steps. Only a cosign is agreed to first. */
export type Step = "confirm" | "write" | "review"

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 18px 22px;
`

export const Scroll = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
`

export const Label = styled.p`
  margin: 0 0 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${ink.mid};
`

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`

const Option = styled.button<{ $on: boolean; $position: ConferencePosition }>`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  text-align: left;
  font-size: 0.8125rem;
  transition: background-color 120ms, border-color 120ms;
  ${({ $on, $position }) => {
    const c = positionColours[$position]
    return $on
      ? `font-weight: 600; background: ${c.onBg}; border: 1px solid ${c.onBorder}; color: ${c.onInk};`
      : `font-weight: 300; background: #fdfdff; border: 1px solid ${line.default}; color: ${ink.strong};
         &:hover { background: ${wash.default}; border-color: ${line.strong}; }`
  }}
`

/** A position's label, in Lexend, as the page's headings are; what it
 * means under it (OptionHelp) keeps the panel's type. */
const OptionTitle = styled.span`
  font-family: var(--maple-font-heading);
`

/** The writing step's two parts, the positions and then the words: one over
 * the other in the drawer and on mobile; side by side from md, the words
 * with twice the positions' room, when the panel fills the window (`$full`)
 * or is a sheet (SHEET_SPREAD, styles.ts). */
const Parts = styled.div<{ $full: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;

  @media ${({ $full }) => ($full ? FULL_LAYOUT : SHEET_SPREAD)} {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    column-gap: 32px;
  }
`

/** The words and their label, the field taking the room left: from md, in
 * the drawer, the sheet and the window alike, all of it, down to the
 * buttons, rather than the field's 280px most, which holds on a phone. */
const Writing = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;

  @media ${FULL_LAYOUT} {
    textarea {
      max-height: none;
    }
  }
`

/** What a position means, under its label where it needs saying: in the
 * panel's muted grey, or picked (`$on`), in the position's own colour, as
 * its label is. */
const OptionHelp = styled.span<{ $on: boolean }>`
  display: block;
  margin-top: 2px;
  font-size: 0.75rem;
  font-weight: 300;
  ${({ $on }) => ($on ? "" : `color: ${ink.mid};`)}
`

const ask = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
`

export const Field = styled.textarea<{ $refused: boolean; $asking: boolean }>`
  flex: 1;
  min-height: 150px;
  max-height: 280px;
  width: 100%;
  resize: none;
  padding: 12px;
  background: var(--maple-surface-base);
  border: 1px solid ${({ $refused }) => ($refused ? red.refused : line.default)};
  border-radius: 8px;
  font-size: 0.875rem;
  line-height: 1.55;
  color: ${ink.strong};
  &::placeholder {
    color: ${ink.faint};
    font-size: 0.875rem;
  }
  &:focus {
    outline: none;
    border-color: ${({ $refused }) => ($refused ? red.refused : brand.fill)};
  }
  animation: ${({ $asking }) => ($asking ? ask : "none")} 620ms ease-out;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
  padding-top: 14px;
`

export const Quiet = styled.button`
  padding: 8px;
  border: 0;
  background: none;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${ink.mid};
  &:hover {
    color: ${ink.strong};
  }
`

/** The way out of the step, a step quieter than the rest. */
export const Muted = styled(Quiet)`
  color: ${ink.muted};
`

/**
 * The panel's go-ahead: MAPLE's primary button (MAPLE blue,
 * styles/globals.css), set as Share your input beside the page's title is
 * (ShareButton.tsx), Lexend, medium, a step bolder below 992px, 6px above and
 * below and 16px a side, at the site's corners; but in the panel's 13px, on
 * Share's 21px line, so as tall. A loading button (components/buttons.tsx),
 * spinning while `loading`.
 *
 * Disabled, or dressed as disabled but still pressable (aria-disabled, where
 * a press shows what is missing), it takes the paler fill, and under the
 * pointer only a shade darker, never the hover's full blue. `&&` lifts these
 * over Bootstrap's own .btn rules whatever order the stylesheets load in.
 */
export const Primary = styled(LoadingButton).attrs({ variant: "primary" })`
  && {
    padding: 0.375rem 1rem;
    font-family: var(--maple-font-heading);
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 21px;
    white-space: nowrap;
  }
  @media (max-width: 991.98px) {
    && {
      font-weight: 600;
    }
  }
  &&:disabled,
  &&[aria-disabled="true"] {
    border-color: transparent;
    background: ${brand.fillDisabled};
    opacity: 1;
  }
  &&[aria-disabled="true"]:hover {
    background: rgba(31, 59, 97, 0.45);
  }
`

/** Posting, on the review step: one width whatever it says, Submit Input or
 * Cosign, and whether it spins. */
const Submit = styled(Primary)`
  && {
    min-width: 9rem;
  }
`

export const Rules = styled.ul`
  margin: 0;
  padding-left: 16px;
  font-size: 0.75rem;
  line-height: 1.5;
  color: ${ink.mid};
  li + li {
    margin-top: 8px;
  }
  li::marker {
    color: ${ink.faint};
  }
`

export const Problem = styled.p`
  margin: 12px 0 0;
  font-size: 0.75rem;
  color: ${red.refused};
`

export const Hint = styled.p`
  margin: 0;
  text-align: right;
  font-size: 0.75rem;
  color: ${ink.mid};
`

/** A field that asks for what is missing: pressed on without it, the field
 * goes red, shakes and takes the focus; words in it settle it. */
export function useAsk(field: RefObject<HTMLElement | null>) {
  const [refused, setRefused] = useState(false)
  const [asking, setAsking] = useState(false)
  return {
    refused,
    asking,
    ask: () => {
      setRefused(true)
      setAsking(false)
      field.current?.focus()
      requestAnimationFrame(() => setAsking(true))
    },
    settle: () => setRefused(false),
    asked: () => setAsking(false)
  }
}

/** The edit reason a republished filing needs, as it does everywhere else. */
function ReasonField({
  value,
  onChange
}: {
  value: string
  onChange: (reason: string) => void
}) {
  const { t } = useTranslation("testimony")
  return (
    <div style={{ marginTop: 20 }}>
      <Label>{t("publish.reasonLabel")}</Label>
      <Field
        rows={3}
        style={{ minHeight: 0, height: "auto", maxHeight: "none" }}
        value={value}
        placeholder={t("publish.reasonPlaceholder")}
        $refused={false}
        $asking={false}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

/** The last of the rules before posting, the same wherever input is filed. */
export function ConductRule() {
  const { t } = useTranslation("conferences")
  return (
    <li>
      <Trans t={t} i18nKey="input.conduct">
        All posts are governed by our
        <Internal href="/policies/code-of-conduct">Code of Conduct</Internal>.
      </Trans>
    </li>
  )
}

/** The step before posting, for input and cosigns alike: where it goes, the
 * letter as it will be sent, the reason when it changes what was posted, and
 * the way to post it. */
export function ReviewStep({
  edit,
  ready,
  posting,
  problem,
  reason,
  onReason,
  onBack,
  onAddLine = onBack,
  onCancel,
  onPost,
  ...letter
}: Omit<ComponentProps<typeof LetterReview>, "testimonyId"> & {
  /** The user's publication on the conference, and the draft it posts
   * through. */
  edit: UseEditConferenceTestimony
  /** There is something to post: input's words, or a cosign with or without. */
  ready: boolean
  posting: boolean
  problem?: ReactNode
  reason: string
  onReason: (reason: string) => void
  onBack: () => void
  /** Add Your Voice, on a cosign without words: back to writing them. */
  onAddLine?: () => void
  onCancel: () => void
  onPost: () => void
}) {
  const { t } = useTranslation("conferences")
  // Republishing needs a reason for the change, as it does everywhere else.
  const editing = !!edit.publication
  const changed =
    !editing ||
    hasDraftChanged(
      {
        position: letter.position,
        content: letter.content
      } as unknown as WorkingDraft,
      edit.publication as unknown as Testimony
    )
  const needsReason = editing && changed
  const canPost =
    ready &&
    changed &&
    (!needsReason || !!reason.trim()) &&
    !posting &&
    !edit.publishTestimony.loading
  const cosign = !!letter.cosign
  return (
    <Body>
      <Scroll>
        <LetterReview
          {...letter}
          // Under a cosign's card: that it is their one input, and, without
          // words of its own, that a line would carry more weight. Under
          // input's: that it stays on the record.
          preview={
            cosign ? (
              <>
                {letter.preview}
                {!letter.content.trim() && <NoLine onAdd={onAddLine} />}
                <CountsOnce />
              </>
            ) : (
              <>
                {letter.preview}
                <OnRecord />
              </>
            )
          }
          testimonyId={edit.publication?.id}
        />
        {needsReason && <ReasonField value={reason} onChange={onReason} />}
        {problem}
      </Scroll>
      <div>
        {!ready && <Hint>{t("input.empty_hint")}</Hint>}
        <Actions>
          <Quiet type="button" onClick={onBack} style={{ marginRight: "auto" }}>
            {t("input.back")}
          </Quiet>
          <Muted type="button" onClick={onCancel}>
            {t("input.cancel")}
          </Muted>
          {/* Spinning from the press until it is posted and the panel goes. */}
          <Submit
            type="button"
            disabled={!canPost}
            loading={posting || edit.publishTestimony.loading}
            onClick={onPost}
          >
            {t(cosign ? "input.cosign" : "review.submit")}
          </Submit>
        </Actions>
      </div>
    </Body>
  )
}

/**
 * Writing, reviewing and posting testimony on a conference, in the panel's
 * two steps. Nothing is kept before Post: the words live in the form until
 * then.
 */
export function InputForm({
  court,
  conferenceId,
  conferees,
  edit,
  subject,
  bills,
  full = false,
  step,
  onStep,
  onCancel,
  onPosted
}: {
  court: number
  conferenceId: string
  /** The conferees, for the weekly update's row. */
  conferees: ConfereeView[]
  /** The user's publication on the conference, and the draft it posts
   * through. */
  edit: UseEditConferenceTestimony
  subject: string
  /** Each chamber's bill, as written (S.2916), for the positions that pass
   * one as it stands. */
  bills: { senate: string; house: string }
  /** The panel fills the window: the positions and the words side by side
   * (Parts). */
  full?: boolean
  step: Step
  onStep: (s: Step) => void
  onCancel: () => void
  /** The words are on the record. */
  onPosted: () => void
}) {
  const { t } = useTranslation("conferences")
  const { profile } = useProfile()
  const { user, claims } = useAuth()
  const { saveDraft, publishTestimony } = edit

  const [position, setPosition] = useState<ConferencePosition>(
    conferencePositions[0]
  )
  const [content, setContent] = useState("")
  const [reason, setReason] = useState("")
  const field = useRef<HTMLTextAreaElement>(null)
  const ask = useAsk(field)

  // Start from what the user posted, if anything; a draft left from before is
  // not theirs to resume. A cosign's words are not this form's.
  const seeded = useRef(false)
  useEffect(() => {
    if (edit.loading || seeded.current) return
    seeded.current = true
    const posted = edit.publication
    if (posted?.cosignOfId) return
    if (posted?.position) setPosition(posted.position)
    if (posted?.content) setContent(posted.content)
  }, [edit.loading, edit.publication])

  const { posting, post } = usePost({
    edit,
    fields: { position, content, reason },
    // A cosign's draft is not this form's, whatever its words.
    matches: (draft, f) =>
      !draft?.cosignOfId &&
      draft?.content === f.content &&
      draft?.position === f.position &&
      (draft?.editReason ?? "") === f.reason,
    write: f =>
      saveDraft.execute({
        position: f.position,
        content: f.content,
        editReason: f.reason || undefined
      }),
    // Publishing clears the draft's reason; the form outlives the post, behind
    // the closed panel, so it clears its own for the next edit too.
    onPosted: () => {
      setReason("")
      onPosted()
    }
  })

  const written = content.trim().length > 0
  const review = () => {
    if (written) return onStep("review")
    ask.ask()
  }

  const failed = edit.error || saveDraft.error || publishTestimony.error

  const name = profile?.fullName || t("input.anonymous")
  // The input as it will be filed, for the review's preview of it on MAPLE.
  const preview = {
    authorUid: user?.uid,
    id: "preview",
    position,
    content,
    authorRole: claims?.role ?? "user",
    authorDisplayName: name,
    fullName: name,
    publishedAt: Timestamp.now()
  } as unknown as ConferenceTestimony

  if (step !== "review")
    return (
      <Body>
        <Scroll>
          <Parts $full={full}>
            <div>
              <Label>{t("input.position_label")}</Label>
              <Options>
                {conferencePositions.map(p => {
                  const help = t(`input.position.${p}.help`, {
                    ...bills,
                    defaultValue: ""
                  })
                  return (
                    <Option
                      key={p}
                      type="button"
                      $on={p === position}
                      $position={p}
                      aria-pressed={p === position}
                      onClick={() => setPosition(p)}
                    >
                      <OptionTitle>{t(`input.position.${p}.long`)}</OptionTitle>
                      {help && (
                        <OptionHelp $on={p === position}>{help}</OptionHelp>
                      )}
                    </Option>
                  )
                })}
              </Options>
            </div>
            <Writing>
              <Label>{t("input.body_label")}</Label>
              <Field
                ref={field}
                value={content}
                placeholder={t(`input.position.${position}.prompt`)}
                $refused={ask.refused}
                $asking={ask.asking}
                onAnimationEnd={ask.asked}
                onChange={e => {
                  if (e.target.value.trim()) ask.settle()
                  setContent(e.target.value)
                }}
              />
            </Writing>
          </Parts>
          {failed && <Problem role="alert">{t("input.error")}</Problem>}
        </Scroll>
        <Actions>
          <Muted type="button" onClick={onCancel}>
            {t("input.cancel")}
          </Muted>
          <Primary type="button" aria-disabled={!written} onClick={review}>
            {t("input.review")}
          </Primary>
        </Actions>
      </Body>
    )

  return (
    <ReviewStep
      edit={edit}
      court={court}
      conferenceId={conferenceId}
      conferees={conferees}
      author={name}
      conference={subject}
      position={position}
      content={content}
      preview={<SitePreview testimony={preview} />}
      ready={written}
      posting={posting}
      problem={failed && <Problem role="alert">{t("input.error")}</Problem>}
      reason={reason}
      onReason={setReason}
      onBack={() => onStep("write")}
      onCancel={onCancel}
      onPost={post}
    />
  )
}
