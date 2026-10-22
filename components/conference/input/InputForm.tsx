import { useCallback, useEffect, useRef, useState } from "react"
import { Timestamp } from "firebase/firestore"
import { Trans, useTranslation } from "next-i18next"
import styled, { keyframes } from "styled-components"
import { useAuth } from "components/auth"
import {
  ConferencePosition,
  ConferenceTestimony,
  hasDraftChanged,
  Testimony,
  useEditConferenceTestimony,
  useProfile,
  WorkingDraft
} from "components/db"
import { Internal } from "components/links"
import { Entry } from "./Entry"
import { conferencePositions, positionColours } from "./positions"
import { brand, ink, line, red, wash } from "./tokens"

export type Step = "compose" | "review"

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 18px 22px;
`

const Scroll = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
`

const Label = styled.p`
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

const ask = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
`

const Field = styled.textarea<{ $refused: boolean; $asking: boolean }>`
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

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
  padding-top: 14px;
`

const Status = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: auto;
  font-size: 0.75rem;
  color: ${ink.mid};
  transition: opacity 500ms;
`

const Quiet = styled.button`
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
const Muted = styled(Quiet)`
  color: ${ink.muted};
`

const Primary = styled.button`
  padding: 8px 18px;
  border: 0;
  border-radius: 8px;
  background: ${brand.fill};
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
  &:hover:not(:disabled) {
    background: ${brand.hover};
  }
  &:disabled,
  &[aria-disabled="true"] {
    background: rgba(31, 59, 97, 0.35);
  }
`

const PreviewBox = styled.div`
  background: var(--maple-surface-base);
  border: 1px solid ${line.default};
  border-radius: 16px;
`

const Rules = styled.ul`
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

const RuleLabel = styled.p`
  margin: 0 0 8px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${ink.mid};
`

const Problem = styled.p`
  margin: 12px 0 0;
  font-size: 0.75rem;
  color: ${red.refused};
`

const Hint = styled.p`
  margin: 0;
  text-align: right;
  font-size: 0.75rem;
  color: ${ink.mid};
`

/** Autosave's two timings, as in the mockup: what was just saved shows for a
 * couple of seconds and then goes. */
const SAVE_AFTER = 1200
const SAVED_FOR = 2000

/**
 * Writing, reviewing and posting testimony on a conference, in the panel's
 * three steps. The draft is the user's own, kept as they type and published
 * from the review step.
 */
export function InputForm({
  uid,
  court,
  conferenceId,
  billId,
  subject,
  step,
  onStep,
  onCancel,
  onPosted
}: {
  uid: string
  court: number
  conferenceId: string
  billId: string
  subject: string
  step: Step
  onStep: (s: Step) => void
  onCancel: () => void
  /** The words are on the record. */
  onPosted: () => void
}) {
  const { t } = useTranslation("conferences")
  const { t: tt } = useTranslation("testimony")
  const { claims } = useAuth()
  const { profile } = useProfile()
  const edit = useEditConferenceTestimony(uid, court, billId, conferenceId)
  const { saveDraft, publishTestimony, discardDraft } = edit

  const [position, setPosition] = useState<ConferencePosition>(
    conferencePositions[0]
  )
  const [content, setContent] = useState("")
  const [reason, setReason] = useState("")
  const [refused, setRefused] = useState(false)
  const [asking, setAsking] = useState(false)
  const [save, setSave] = useState<"none" | "saving" | "saved" | "fading">(
    "none"
  )
  const [posting, setPosting] = useState(false)
  const field = useRef<HTMLTextAreaElement>(null)

  // Start from what the user already has: their draft, else what they posted.
  const seeded = useRef(false)
  useEffect(() => {
    if (edit.loading || seeded.current) return
    seeded.current = true
    const source = edit.draft ?? edit.publication
    if (source?.position) setPosition(source.position)
    if (source?.content) setContent(source.content)
    if (edit.draft?.editReason) setReason(edit.draft.editReason)
  }, [edit.loading, edit.draft, edit.publication])

  // Saving what the draft already holds fires no snapshot, which would leave
  // the hook waiting on one, so only differing words are saved.
  const held = useRef(edit.draft)
  held.current = edit.draft
  const inSync = (c: string, p: ConferencePosition, r: string) =>
    held.current?.content === c &&
    held.current?.position === p &&
    (held.current?.editReason ?? "") === r
  const write = () =>
    saveDraft.execute({ position, content, editReason: reason || undefined })

  // Keep the draft as they type. The first render is not a change.
  const touched = useRef(false)
  const dirty = useRef(false)
  useEffect(() => {
    if (!touched.current) {
      touched.current = true
      return
    }
    if (!content.trim() || inSync(content, position, reason))
      return setSave("none")
    dirty.current = true
    setSave("saving")
    const id = setTimeout(async () => {
      await write()
      dirty.current = false
      setSave("saved")
    }, SAVE_AFTER)
    return () => clearTimeout(id)
    // saveDraft is a new object each render; the inputs are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, content, reason])

  useEffect(() => {
    if (save !== "saved") return
    const fade = setTimeout(() => setSave("fading"), SAVED_FOR)
    const gone = setTimeout(() => setSave("none"), SAVED_FOR + 600)
    return () => {
      clearTimeout(fade)
      clearTimeout(gone)
    }
  }, [save])

  const written = content.trim().length > 0
  const review = () => {
    if (written) return onStep("review")
    setRefused(true)
    setAsking(false)
    field.current?.focus()
    requestAnimationFrame(() => setAsking(true))
  }

  // Publishing reads the draft the hook holds, which follows the save by a
  // snapshot: wait until it is the words on screen.
  const post = async () => {
    setPosting(true)
    if (!inSync(content, position, reason)) await write()
  }
  useEffect(() => {
    if (!posting || edit.draftLoading) return
    if (!inSync(content, position, reason)) return
    setPosting(false)
    // A failure shows through publishTestimony.error.
    publishTestimony.execute().then(onPosted, () => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posting, edit.draft, edit.draftLoading])

  const discard = useCallback(async () => {
    await discardDraft.execute()
    setContent("")
    setPosition(conferencePositions[0])
    setSave("none")
    onCancel()
  }, [discardDraft, onCancel])

  const failed =
    edit.error ||
    saveDraft.error ||
    publishTestimony.error ||
    discardDraft.error
  // Republishing needs a reason for the change, as it does everywhere else.
  const editing = !!edit.publication
  const changed =
    !editing ||
    hasDraftChanged(
      { position, content } as unknown as WorkingDraft,
      edit.publication as unknown as Testimony
    )
  const needsReason = editing && changed
  const showDelete = !!edit.draft && save === "none" && !dirty.current

  const name = profile?.fullName || t("input.anonymous")
  const entry = {
    authorUid: uid,
    id: "preview",
    position,
    content,
    authorRole: claims?.role ?? "user",
    authorDisplayName: name,
    fullName: name,
    publishedAt: Timestamp.now()
  } as unknown as ConferenceTestimony

  if (step === "compose")
    return (
      <Body>
        <Scroll>
          <Label>{t("input.position_label")}</Label>
          <Options>
            {conferencePositions.map(p => (
              <Option
                key={p}
                type="button"
                $on={p === position}
                $position={p}
                aria-pressed={p === position}
                onClick={() => setPosition(p)}
              >
                {t(`input.position.${p}.long`)}
              </Option>
            ))}
          </Options>
          <Label>{t("input.body_label")}</Label>
          <Field
            ref={field}
            value={content}
            placeholder={t("input.prompt")}
            $refused={refused}
            $asking={asking}
            onAnimationEnd={() => setAsking(false)}
            onChange={e => {
              if (e.target.value.trim()) setRefused(false)
              setContent(e.target.value)
            }}
          />
          {failed && <Problem role="alert">{t("input.error")}</Problem>}
        </Scroll>
        <Actions>
          <Status style={{ opacity: save === "fading" ? 0 : 1 }}>
            {save === "saving" && t("input.saving")}
            {(save === "saved" || save === "fading") && t("input.saved")}
            {showDelete && (
              <Quiet type="button" onClick={discard} style={{ marginLeft: -8 }}>
                {t("input.delete_draft")}
              </Quiet>
            )}
          </Status>
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
    <Body>
      <Scroll>
        <Label>
          {t("input.preview_label")}{" "}
          <em style={{ fontWeight: 400, color: ink.mid }}>
            {t("input.preview_on", { subject })}
          </em>
        </Label>
        <PreviewBox>
          <Entry testimony={entry} bare />
        </PreviewBox>
        <div style={{ marginTop: 20 }}>
          <RuleLabel>{t("input.rules_label")}</RuleLabel>
          <Rules>
            <li>{t("input.rule_public")}</li>
            <li>{t("input.rule_revise")}</li>
            <li>
              <Trans t={t} i18nKey="input.conduct">
                All posts are governed by our
                <Internal href="/policies/code-of-conduct">
                  Code of Conduct
                </Internal>
                .
              </Trans>
            </li>
          </Rules>
        </div>
        {needsReason && (
          <div style={{ marginTop: 20 }}>
            <Label>{tt("publish.reasonLabel")}</Label>
            <Field
              rows={3}
              style={{ minHeight: 0, height: "auto", maxHeight: "none" }}
              value={reason}
              placeholder={tt("publish.reasonPlaceholder")}
              $refused={false}
              $asking={false}
              onChange={e => setReason(e.target.value)}
            />
          </div>
        )}
        {failed && <Problem role="alert">{t("input.error")}</Problem>}
      </Scroll>
      <div>
        {!written && <Hint>{t("input.empty_hint")}</Hint>}
        <Actions>
          <Quiet
            type="button"
            onClick={() => onStep("compose")}
            style={{ marginRight: "auto" }}
          >
            {t("input.back")}
          </Quiet>
          <Muted type="button" onClick={onCancel}>
            {t("input.cancel")}
          </Muted>
          <Primary
            type="button"
            disabled={
              !written ||
              !changed ||
              (needsReason && !reason.trim()) ||
              posting ||
              publishTestimony.loading
            }
            onClick={post}
          >
            {t("input.post")}
          </Primary>
        </Actions>
      </div>
    </Body>
  )
}
