import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react"
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
import { MOBILE_LAYOUT } from "../styles"
import type { ConfereeView } from "../types"
import { Body as Words } from "./ClampedText"
import { accountTypeOf, initialsOf, nameOf } from "./accounts"
import { CosignDescriptor, CosignDisc } from "./Cosigns"
import { Cosigned, filedOn, NoWords, PositionChip } from "./Entry"
import {
  Actions,
  Body,
  ConductRule,
  Field,
  Label,
  Muted,
  Primary,
  Problem,
  ReviewStep,
  Rules,
  Scroll,
  Step,
  useAsk
} from "./InputForm"
import { UsersRound } from "./icons"
import { brand, ink, line, recess, red, wash } from "./tokens"
import { usePost } from "./usePost"

/** On mobile, where the letter sits above it, the agreeing step is as tall as
 * what it holds and does not scroll by itself: it scrolls with the letter, in
 * the panel (Split in Panel.tsx). */
const Column = styled(Body)<{ $natural?: boolean }>`
  @media ${MOBILE_LAYOUT} {
    ${({ $natural }) =>
      $natural
        ? `flex: none; ${Scroll} { flex: none; overflow: visible; }`
        : ""}
  }
`

const Card = styled.div`
  flex-shrink: 0;
  overflow: hidden;
  background: var(--maple-surface-base);
  border: 1px solid ${line.default};
  border-radius: 16px;
`

/** Who and when, over the card. Not on mobile, where the letter just above
 * says it. */
const CardHead = styled.div`
  padding: 20px 22px 16px;

  @media ${MOBILE_LAYOUT} {
    display: none;
  }
`

/** Each part of the card, ruled off from the one above; on mobile, with no
 * head over it, the first opens on the card's rounded top. */
const CardSection = styled.div`
  padding: 18px 22px;
  border-top: 1px solid ${line.default};

  @media ${MOBILE_LAYOUT} {
    ${CardHead} + & {
      border-top: 0;
    }
  }
`

const Signing = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 8px;
  margin: 0;
  font-family: var(--maple-font-heading);
  font-weight: 400;
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

/** Under the no-words checkbox while it's ticked, in line with the box, 6px
 * in from the field above as the box is (NoWordsTick): the case for adding
 * a line, set as the mockup's note under its weekly-email checkbox
 * (DigestChoice in its compose.tsx). */
const AreYouSure = styled.p`
  margin: -5px 0 0;
  padding: 0 6px;
  font-family: var(--maple-font-body);
  font-weight: 300;
  font-style: italic;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: ${ink.mid};
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

/** The no-words checkbox under the field: 6px of padding at its sides, inside
 * its hover's wash, so the box sits 6px in from the field above. The
 * letter's own checkbox (CosignConfirm) keeps its 12px, for the wash it
 * takes when asked. */
const NoWordsTick = styled(Tick)`
  && {
    padding-left: 6px;
    padding-right: 6px;
  }
`

/** Dressed as disabled but pressable (Primary's aria-disabled): the press is
 * how the reader finds out what is missing. A thumb's worth of target on a
 * phone. */
const Press = styled(Primary)`
  @media (max-width: 639.98px) {
    && {
      padding: 14px 24px;
    }
  }
`

/** Agreeing to the letter: the whole column's width, and taller. */
const Continue = styled(Press)`
  && {
    flex-shrink: 0;
    width: 100%;
    margin-top: 12px;
    padding: 11px 22px;
  }
`

/** A thumb's worth of target on a phone, as the mockup's footer has. */
const Leave = styled(Muted)`
  @media (max-width: 639.98px) {
    padding: 14px 12px;
  }
`

/** Where the cosign will land, on the writing step and in the review step's
 * On MAPLE preview (Review.tsx): the card's own pieces, in its type (Entry.tsx), without its
 * date and actions, since nothing here is filed yet. */
const Preview = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  font-family: var(--maple-font-body);
  padding: 14px 16px 20px;
  background: var(--maple-surface-base);
  border: 1px solid ${line.default};
  border-radius: 8px;
`

/** The preview on the writing step, its label and card, over the field with
 * room under it (on the review step the well gives its own). Never more than
 * half the panel's height, so the field below always has room; a longer
 * card scrolls in its well. */
const PreviewHold = styled.div`
  flex: none;
  display: flex;
  flex-direction: column;
  max-height: 50%;
  margin-bottom: 20px;
`

/** The card in a recessed well, as the review step's previews are
 * (Review.tsx), scrolling in it without springing past its ends when the
 * card is taller than the well. */
const PreviewWell = styled.div`
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: none;
  padding: 12px;
  background: ${recess};
  border: 1px solid var(--maple-surface-border);
  border-radius: 5px;
`

/** The cosign row's name line (Cosigns.tsx), 13px in Nunito; the position
 * chip at its size everywhere else, 11px. */
const PreviewName = styled.p`
  /* Names in the card's Nunito, as Entry's are, at 500; "cosigned"
     (Cosigned) and the chip keep their own weights. */
  font-family: var(--maple-font-body);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.2;
  color: ${ink.strong};
`

/** As the cosign row has them: the name line, the account type 4px under
 * it, and 8px under that, in the muted grey, the reader's words as they
 * write them, or the note on a cosign with none. */
const PreviewText = styled.div`
  flex: 1;
  min-width: 0;
  > :nth-child(2) {
    margin-top: 4px;
  }
  > :nth-child(3) {
    margin-top: 8px;
  }
  > :nth-child(3),
  > :nth-child(3) * {
    color: ${ink.mid};
  }
  /* The note on a cosign with none, in the card's own grey for it (Entry's
     NoWords), not the words'. */
  ${NoWords} {
    color: ${ink.faint};
  }
`

/** The card over a hidden copy of it with the note on a cosign with none, so
 * what holds it keeps that height at any width: the card itself is only as
 * tall as what it shows, growing with the words until they are cut at the
 * note's last line (CutWords). */
const Stack = styled.div<{ $hold: boolean }>`
  display: grid;
  > * {
    grid-area: 1 / 1;
    align-self: start;
  }
  > [aria-hidden] {
    visibility: hidden;
    /* Not holding the height (the review step, where notes follow the card),
       the copy is still laid out, for the words' cut, at no height. */
    ${({ $hold }) => ($hold ? "" : "height: 0; overflow: hidden;")}
  }
`

/** In place of the card until the reader writes, or says they won't: in its
 * room (Stack), centred, muted, as the review's Coming soon! is (Review.tsx). */
const Empty = styled.p`
  && {
    align-self: stretch;
  }
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  font-size: 0.8125rem;
  color: ${ink.mid};
`

/** The words, and their hidden measuring copy. */
const Cut = styled.div`
  position: relative;
  overflow: hidden;
  overflow-wrap: anywhere;
  > [aria-hidden] {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    visibility: hidden;
  }
`

/** Kept free after the ellipsis on the last line, so it reads as one. */
const Room = styled.span`
  display: inline-block;
  width: 24px;
`

/**
 * The words cut to `lines` lines, the ellipsis ending short of the last
 * line's end; only that line is shortened. The cut is found by measuring a
 * hidden copy, as ClampedText does.
 */
function CutWords({ text, lines }: { text: string; lines: number }) {
  const [cut, setCut] = useState<number | null>(null)
  const measureRef = useRef<HTMLParagraphElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const roomRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const m = measureRef.current
    const s = textRef.current
    const room = roomRef.current
    if (!m || !s || !room) return
    // Only a new width moves the cut; trying cuts changes the height alone.
    let measured = -1
    const compute = () => {
      if (m.clientWidth === measured) return
      measured = m.clientWidth
      const line = parseFloat(getComputedStyle(m).lineHeight)
      if (!line) return
      const max = line * lines + 2
      const fits = (shown: string, withRoom: boolean) => {
        s.textContent = shown
        room.style.display = withRoom ? "" : "none"
        return m.offsetHeight <= max
      }
      if (fits(text, false)) return setCut(null)
      let lo = 0
      let hi = text.length
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2)
        if (fits(`${text.slice(0, mid).trimEnd()}…`, true)) lo = mid
        else hi = mid - 1
      }
      setCut(lo)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(m)
    return () => ro.disconnect()
  }, [text, lines])

  return (
    <Cut>
      <Words $small>
        {cut === null ? text : `${text.slice(0, cut).trimEnd()}…`}
      </Words>
      <Words $small aria-hidden ref={measureRef}>
        <span ref={textRef} />
        <Room ref={roomRef} />
      </Words>
    </Cut>
  )
}

/** How many lines `el` takes, again whenever its width changes. */
function useLinesOf(el: HTMLElement | null) {
  const [lines, setLines] = useState(2)
  useEffect(() => {
    if (!el) return
    const measure = () => {
      const line = parseFloat(getComputedStyle(el).lineHeight)
      if (line) setLines(Math.max(1, Math.round(el.offsetHeight / line)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  return lines
}

const Optional = styled(Cosigned)`
  color: ${ink.faint};
`

/** `$off` while the reader has said they'll add no words: greyed, and
 * disabled until they untick the box. */
const NoteField = styled(Field)<{ $off: boolean }>`
  ${({ $off }) => ($off ? `background: ${wash.default};` : "")}
`

/** A refusal the server words for the reader's situation, rather than the
 * form's general apology. */
const refusalOf = (error?: Error) =>
  ((error as FunctionsError | undefined)?.details as RefusalDetails | undefined)
    ?.refusal

/**
 * Cosigning someone else's input, in the panel's three steps: agreeing to
 * what is signed, an optional note of one's own, and the review every input
 * goes through. Editing a cosign starts at the note, and changes it only.
 * Nothing is kept before Post.
 */
export function CosignForm({
  edit,
  parent,
  court,
  conferenceId,
  subject,
  conferees,
  step,
  onStep,
  onCancel,
  onPosted
}: {
  court: number
  conferenceId: string
  /** What the conference is called, for the letter's subject. */
  subject: string
  /** The conferees, for the weekly update's row. */
  conferees: ConfereeView[]
  /** The user's publication on the conference, and the draft it posts
   * through. */
  edit: UseEditConferenceTestimony
  /** What is being cosigned. */
  parent: ConferenceTestimony
  step: Step
  onStep: (s: Step) => void
  onCancel: () => void
  /** The cosign is on the record. */
  onPosted: () => void
}) {
  const { t } = useTranslation("conferences")
  const { claims } = useAuth()
  const { profile } = useProfile()
  const { saveDraft, publishTestimony } = edit

  const [note, setNote] = useState("")
  const [noWords, setNoWords] = useState(false)
  // The preview's hidden note, whose lines the words are cut to.
  const [held, setHeld] = useState<HTMLElement | null>(null)
  const lines = useLinesOf(held)
  const [reason, setReason] = useState("")
  const field = useRef<HTMLTextAreaElement>(null)
  const ask = useAsk(field)

  // Start from what the user posted, if anything; a draft left from before is
  // not theirs to resume. A cosign posted without words is edited as one.
  const seeded = useRef(false)
  useEffect(() => {
    if (edit.loading || seeded.current) return
    seeded.current = true
    const posted = edit.publication
    setNote(posted?.content ?? "")
    if (posted && !posted.content) setNoWords(true)
  }, [edit.loading, edit.publication])

  const content = noWords ? "" : note
  const { posting, post } = usePost({
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
    // As InputForm's: the form outlives the post, so its reason goes too.
    onPosted: () => {
      setReason("")
      onPosted()
    }
  })

  // Ready to write on arrival, the panel left at its top; not while they've
  // said no words, when the field is off.
  useEffect(() => {
    const el = field.current
    if (step !== "write" || noWords || !el) return
    el.focus({ preventScroll: true })
    // The caret after what they have written, to carry on from there.
    el.setSelectionRange(el.value.length, el.value.length)
    // Only on arrival: ticking or unticking the box moves no focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const ready = !!note.trim() || noWords
  const failed = edit.error || saveDraft.error || publishTestimony.error
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

  if (step === "confirm")
    return (
      <CosignConfirm
        parent={parent}
        problem={problem}
        onAgree={() => onStep("write")}
      />
    )

  const name = profile?.fullName || t("input.anonymous")
  const type = accountTypeOf(claims?.role ?? "user")
  // How the cosign will look on MAPLE, for the review's preview of it.
  const card = (said: ReactNode) => (
    <Preview>
      {/* As the cosign row it previews draws it (Cosigns.tsx). */}
      <CosignDisc>{initialsOf(name)}</CosignDisc>
      <PreviewText>
        <PreviewName>
          {name}
          <Cosigned>{t("input.cosigned")}</Cosigned>
          <span>{nameOf(parent)}</span>
          <PositionChip position={parent.position} />
        </PreviewName>
        <CosignDescriptor>{t(`input.descriptor_${type}`)}</CosignDescriptor>
        {said}
      </PreviewText>
    </Preview>
  )
  // At the cards' smaller size (13px), the note and the words alike. As the
  // reader writes (`hold`), the words are cut to the room the card holds;
  // on the review step, whole, as they will be posted.
  const preview = (hold: boolean) => (
    <Stack $hold={hold}>
      {/* Hidden, the card with the note, holding its height. */}
      <div aria-hidden>
        {card(
          <NoWords $small ref={setHeld}>
            {t("input.cosign_no_words")}
          </NoWords>
        )}
      </div>
      {noWords ? (
        card(<NoWords $small>{t("input.cosign_no_words")}</NoWords>)
      ) : note.trim() ? (
        // The reader's words as they write them.
        card(
          hold ? (
            <CutWords text={note} lines={lines} />
          ) : (
            <Words $small>{note}</Words>
          )
        )
      ) : (
        // Nothing to show yet: where the card will be, in its room.
        <Empty>{t("input.cosign_preview_empty")}</Empty>
      )}
    </Stack>
  )
  if (step === "review")
    return (
      <ReviewStep
        edit={edit}
        court={court}
        conferenceId={conferenceId}
        conferees={conferees}
        author={name}
        conference={subject}
        position={parent.position}
        content={content}
        cosign={{ author: nameOf(parent), content: parent.content }}
        preview={preview(false)}
        ready={ready}
        posting={posting}
        problem={problem}
        reason={reason}
        onReason={setReason}
        onBack={() => onStep("write")}
        // Unticks "no words of my own", so they arrive in the field to write.
        onAddLine={() => {
          setNoWords(false)
          onStep("write")
        }}
        onCancel={onCancel}
        onPost={post}
      />
    )
  return (
    <Body>
      <Scroll>
        <PreviewHold>
          <Label>{t("input.cosign_preview_label")}</Label>
          <PreviewWell>{preview(true)}</PreviewWell>
        </PreviewHold>
        <Label>
          {t("input.cosign_body_label")}{" "}
          <Optional>{t("input.cosign_optional")}</Optional>
        </Label>
        <NoteField
          ref={field}
          value={content}
          // Off while they've said no words: no focus, caret or typing until
          // they untick the box, which brings back what they had written.
          disabled={noWords}
          $off={noWords}
          placeholder={noWords ? "" : t("input.cosign_prompt")}
          $refused={ask.refused}
          $asking={ask.asking}
          onAnimationEnd={ask.asked}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            if (e.target.value.trim()) ask.settle()
            setNote(e.target.value)
          }}
        />
        <NoWordsTick
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
        </NoWordsTick>
        {noWords && <AreYouSure>{t("input.cosign_no_words_sure")}</AreYouSure>}
        {problem}
      </Scroll>
      <Actions>
        <Leave type="button" onClick={onCancel}>
          {t("input.cancel")}
        </Leave>
        <Press
          type="button"
          aria-disabled={!ready}
          onClick={() => (ready ? onStep("review") : ask.ask())}
        >
          {t("input.cosign_review")}
        </Press>
      </Actions>
    </Body>
  )
}

/** The first step: what is signed, what signing does, and the reader saying
 * they have read it. */
function CosignConfirm({
  parent,
  problem,
  onAgree
}: {
  parent: ConferenceTestimony
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
