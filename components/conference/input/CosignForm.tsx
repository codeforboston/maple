import { useCallback, useEffect, useRef, useState } from "react"
import { FunctionsError } from "firebase/functions"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { useAuth } from "components/auth"
import {
  ConferenceTestimony,
  UseEditConferenceTestimony,
  useProfile
} from "components/db"
import type { RefusalDetails } from "functions/src/testimony/types"
import { Body as Words } from "./ClampedText"
import { accountTypeOf, initialsOf, nameOf } from "./accounts"
import {
  Cosigned,
  Descriptor,
  Disc,
  filedOn,
  NoWords,
  PositionChip
} from "./Entry"
import {
  Actions,
  Body,
  ConductRule,
  Field,
  Label,
  Muted,
  Primary,
  Problem,
  Quiet,
  ReasonField,
  Rules,
  Scroll,
  Status,
  useAsk
} from "./InputForm"
import { useInputContext } from "./context"
import { UsersRound } from "./icons"
import { brand, caution, ink, line, red, wash } from "./tokens"
import { useAutosave } from "./useAutosave"

export type CosignStep = "confirm" | "write"

/** Below lg, where the letter sits above it, the agreeing step takes the room
 * it needs and leaves the letter the rest. */
const Column = styled(Body)<{ $natural?: boolean }>`
  @media (max-width: 1023.98px) {
    ${({ $natural }) => ($natural ? "flex: none;" : "")}
  }
`

const Card = styled.div`
  flex-shrink: 0;
  overflow: hidden;
  background: var(--maple-surface-base);
  border: 1px solid ${line.default};
  border-radius: 16px;
`

const CardHead = styled.div`
  padding: 20px 22px 16px;
`

const CardSection = styled.div`
  padding: 18px 22px;
  border-top: 1px solid ${line.default};
`

const Signing = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 8px;
  margin: 0;
  font-family: var(--maple-font-heading);
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.3;
  color: ${ink.strong};
`

const Facts = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 3px 7px;
  margin: 7px 0 0;
  font-size: 0.8125rem;
  color: ${ink.mid};
  b {
    color: ${ink.strong};
  }
`

const Dot = styled.span`
  color: ${ink.faint};
`

/** The reader's other cosign note, which agreeing here writes over. */
const Replaces = styled.p`
  flex-shrink: 0;
  margin: 16px 0 0;
  padding: 10px 12px;
  border-left: 3px solid ${caution};
  border-radius: 4px;
  background: ${wash.default};
  font-size: 0.8125rem;
  line-height: 1.45;
  color: ${ink.strong};
`

const Tally = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

const Para = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.55;
  color: ${ink.strong};
  & + & {
    margin-top: 12px;
  }
`

/** A checkbox row: the reader answering for themselves, the whole row a
 * target. Asked and unanswered, it goes red, and `$washed` too. */
const Tick = styled.label<{ $asked: boolean; $washed?: boolean }>`
  display: flex;
  flex-shrink: 0;
  align-items: flex-start;
  gap: 12px;
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ $washed }) => ($washed ? wash.default : "none")};
  transition: background-color 120ms;
  &:hover {
    background: ${wash.default};
  }
  input {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    margin-top: 2px;
    accent-color: ${brand.fill};
    cursor: pointer;
  }
  span {
    flex: 1;
    font-size: 0.8125rem;
    font-weight: 300;
    line-height: 1.45;
    color: ${({ $asked }) => ($asked ? red.refused : ink.strong)};
  }
`

/** Dressed as disabled but pressable: the press is how the reader finds out
 * what is missing, so it does not light up under the pointer either. */
const Press = styled(Primary)`
  @media (max-width: 639.98px) {
    padding: 14px 24px;
  }
  &[aria-disabled="true"],
  &[aria-disabled="true"]:hover {
    background: rgba(31, 59, 97, 0.35);
  }
`

/** The mockup sets this one a shade paler than the form's own. */
const Continue = styled(Press)`
  flex-shrink: 0;
  width: 100%;
  margin-top: 12px;
  padding: 11px 22px;
  font-size: 0.875rem;
  &[aria-disabled="true"],
  &[aria-disabled="true"]:hover {
    background: rgba(31, 59, 97, 0.4);
  }
`

/** A thumb's worth of target on a phone, as the mockup's footer has. */
const Leave = styled(Muted)`
  @media (max-width: 639.98px) {
    padding: 14px 12px;
  }
`

/** Where the cosign will land: the card's own pieces, without its date and
 * actions, since nothing here is filed yet. */
const Preview = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 14px;
  margin-bottom: 20px;
  padding: 14px 16px 20px;
  background: var(--maple-surface-base);
  border: 1px solid ${line.default};
  border-radius: 8px;
`

const PreviewDisc = styled(Disc)`
  width: 36px;
  height: 36px;
  border: 0;
`

const PreviewName = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  color: ${ink.strong};
`

const PreviewText = styled.div`
  flex: 1;
  min-width: 0;
  > :last-child {
    margin-top: 10px;
  }
`

const Optional = styled(Cosigned)`
  color: ${ink.faint};
`

const NoteField = styled(Field)`
  &:disabled {
    background: ${wash.default};
    cursor: not-allowed;
  }
`

/** A refusal the server words for the reader's situation, rather than the
 * form's general apology. */
const refusalOf = (error?: Error) =>
  ((error as FunctionsError | undefined)?.details as RefusalDetails | undefined)
    ?.refusal

/**
 * Cosigning someone else's input, in the panel's two steps: agreeing to what
 * is signed, then an optional note of one's own. Editing a cosign is the
 * second step alone, and changes the note only. The cosign is the user's one
 * draft on the conference, kept as they type.
 */
export function CosignForm({
  edit,
  parent,
  step,
  onStep,
  onCancel,
  onPosted
}: {
  /** The user's draft and publication on the conference. */
  edit: UseEditConferenceTestimony
  /** What is being cosigned. */
  parent: ConferenceTestimony
  step: CosignStep
  onStep: (s: CosignStep) => void
  onCancel: () => void
  /** The cosign is on the record. */
  onPosted: () => void
}) {
  const { t } = useTranslation("conferences")
  const { claims } = useAuth()
  const { byId } = useInputContext()
  const { profile } = useProfile()
  const { saveDraft, publishTestimony, discardDraft } = edit
  const editing = !!edit.publication

  const [note, setNote] = useState("")
  const [noWords, setNoWords] = useState(false)
  const [reason, setReason] = useState("")
  const field = useRef<HTMLTextAreaElement>(null)
  const ask = useAsk(field)

  // Start from what the user already has on this parent: their draft, else
  // what they posted. A cosign posted without words is edited as one.
  const seeded = useRef(false)
  useEffect(() => {
    if (edit.loading || seeded.current) return
    seeded.current = true
    const seed =
      edit.draft?.cosignOfId === parent.id
        ? edit.draft.content ?? ""
        : edit.publication?.content ?? ""
    setNote(seed)
    // Words drafted since are kept over the posted cosign's having none.
    if (edit.publication && !edit.publication.content && !seed) setNoWords(true)
    if (edit.draft?.editReason) setReason(edit.draft.editReason)
  }, [edit.loading, edit.draft, edit.publication, parent.id])

  const content = noWords ? "" : note
  const { save, dirty, posting, post, flush, reset } = useAutosave({
    edit,
    fields: { content, reason },
    matches: (draft, f) =>
      draft?.cosignOfId === parent.id &&
      draft?.content === f.content &&
      (draft?.editReason ?? "") === f.reason,
    write: f =>
      saveDraft.execute({
        position: parent.position,
        content: f.content,
        cosignOfId: parent.id,
        cosignOfAuthorUid: parent.authorUid,
        editReason: f.reason || undefined
      }),
    active: step === "write",
    onPosted
  })

  // Ready to write on arrival, without scrolling the preview out of view.
  useEffect(() => {
    if (step === "write") field.current?.focus({ preventScroll: true })
  }, [step])

  const ready = !!note.trim() || noWords
  const changed = !editing || content !== edit.publication?.content
  const needsReason = editing && changed
  // Delete Draft is offered once there are words kept to delete.
  const kept = edit.draft?.cosignOfId === parent.id && !!edit.draft.content
  const showDelete = !editing && kept && save === "none" && !dirty

  const discard = useCallback(async () => {
    await discardDraft.execute()
    setNote("")
    setNoWords(false)
    reset()
    onCancel()
  }, [discardDraft, onCancel, reset])

  const failed =
    edit.error ||
    saveDraft.error ||
    publishTestimony.error ||
    discardDraft.error
  const refusal = refusalOf(publishTestimony.error)
  const problem = failed && (
    <Problem role="alert">
      {t(
        refusal === "cosignParentGone"
          ? "input.cosign_parent_gone"
          : refusal === "conferenceClosed"
          ? "input.cosign_closed"
          : "input.error"
      )}
    </Problem>
  )

  // The one draft holds one cosign, so agreeing here writes over a note
  // drafted for another.
  const other =
    edit.draft?.cosignOfId !== parent.id &&
    edit.draft?.content?.trim() &&
    edit.draft.cosignOfId
  const replaced = other ? byId.get(other) : undefined
  const replaces = other && (
    <Replaces role="note">
      {replaced
        ? t("input.cosign_replaces", { name: nameOf(replaced) })
        : t("input.cosign_replaces_gone")}
    </Replaces>
  )
  if (step === "confirm")
    return (
      <CosignConfirm
        parent={parent}
        replaces={replaces}
        problem={problem}
        onAgree={() => {
          // Agreeing makes this the user's draft, on this parent. A failure
          // shows through saveDraft.error.
          flush().catch(() => {})
          onStep("write")
        }}
      />
    )

  const name = profile?.fullName || t("input.anonymous")
  const type = accountTypeOf(claims?.role ?? "user")
  return (
    <Body>
      <Scroll>
        <Label>{t("input.preview_label")}</Label>
        <Preview>
          <PreviewDisc>{initialsOf(name)}</PreviewDisc>
          <PreviewText>
            <PreviewName>
              {name}
              <Cosigned>{t("input.cosigned")}</Cosigned>
              <span>{nameOf(parent)}</span>
              <PositionChip position={parent.position} />
            </PreviewName>
            <Descriptor>{t(`input.descriptor_${type}`)}</Descriptor>
            {noWords ? (
              <NoWords $small={false}>{t("input.cosign_no_words")}</NoWords>
            ) : (
              <Words $small={false}>{t("input.cosign_lands")}</Words>
            )}
          </PreviewText>
        </Preview>
        <Label>
          {t("input.cosign_body_label")}{" "}
          <Optional>{t("input.cosign_optional")}</Optional>
        </Label>
        <NoteField
          ref={field}
          value={content}
          disabled={noWords}
          placeholder={noWords ? "" : t("input.cosign_prompt")}
          $refused={ask.refused}
          $asking={ask.asking}
          onAnimationEnd={ask.asked}
          onChange={e => {
            if (e.target.value.trim()) ask.settle()
            setNote(e.target.value)
          }}
        />
        <Tick
          $asked={ask.refused}
          style={{ marginTop: 8, alignItems: "center" }}
        >
          <input
            type="checkbox"
            checked={noWords}
            style={{ marginTop: 0 }}
            onChange={() => {
              setNoWords(v => !v)
              ask.settle()
            }}
          />
          <span>{t("input.cosign_no_words_label")}</span>
        </Tick>
        {needsReason && <ReasonField value={reason} onChange={setReason} />}
        {problem}
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
        <Leave type="button" onClick={onCancel}>
          {t("input.cancel")}
        </Leave>
        <Press
          type="button"
          aria-disabled={!ready}
          disabled={
            (editing && (!changed || !reason.trim())) ||
            posting ||
            publishTestimony.loading
          }
          onClick={() => (ready ? post() : ask.ask())}
        >
          {t(editing ? "input.cosign_save" : "input.cosign")}
        </Press>
      </Actions>
    </Body>
  )
}

/** The first step: what is signed, what signing does, and the reader saying
 * they have read it. */
function CosignConfirm({
  parent,
  replaces,
  problem,
  onAgree
}: {
  parent: ConferenceTestimony
  /** The warning that agreeing writes over a note cosigning another. */
  replaces: React.ReactNode
  problem: React.ReactNode
  onAgree: () => void
}) {
  const { t, i18n } = useTranslation("conferences")
  const [agreed, setAgreed] = useState(false)
  const [asked, setAsked] = useState(false)
  const name = nameOf(parent)
  const count = parent.cosignCount ?? 0
  return (
    <Column $natural>
      <Scroll>
        <Card>
          <CardHead>
            <Signing>
              {name}
              <PositionChip position={parent.position} />
            </Signing>
            <Facts>
              {filedOn(parent, i18n.language)}
              <Dot aria-hidden>·</Dot>
              <Tally>
                <UsersRound size={15} />
                <span>
                  <b>{count}</b> {t("input.cosign_count", { count })}
                </span>
              </Tally>
            </Facts>
          </CardHead>
          <CardSection>
            <Para>{t("input.cosign_invite")}</Para>
            <Para>{t("input.cosign_next")}</Para>
          </CardSection>
          <CardSection>
            <Rules>
              <li>{t("input.cosign_rule_counts")}</li>
              <li>{t("input.cosign_rule_one")}</li>
              <li>{t("input.rule_public")}</li>
              <li>{t("input.rule_revise")}</li>
              <ConductRule />
            </Rules>
          </CardSection>
        </Card>
        {replaces}
        <Tick
          $asked={asked && !agreed}
          $washed={asked && !agreed}
          style={{ marginTop: 16 }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => {
              setAgreed(v => !v)
              setAsked(false)
            }}
          />
          <span>{t("input.cosign_agree", { name })}</span>
        </Tick>
        <Continue
          type="button"
          aria-disabled={!agreed}
          onClick={() => (agreed ? onAgree() : setAsked(true))}
        >
          {t("input.cosign_continue")}
        </Continue>
        {problem}
      </Scroll>
    </Column>
  )
}
