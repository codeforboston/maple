import { Fragment, KeyboardEvent, useRef, useState } from "react"
import { Trans, useTranslation } from "next-i18next"
import ReactMarkdown from "react-markdown"
import styled from "styled-components"
import { FEEDBACK_URL } from "../common"
import { shortName } from "../formatting"
import { yoursKey } from "./Conferees"
import { useMyLegislators } from "./hooks"
import { ArrowRight, Check, ChevronRight, Star } from "./input/icons"
import {
  brand,
  caution,
  chamberInk,
  ink,
  keptTint,
  lawInk,
  line,
  positive,
  shadow,
  wash,
  yea
} from "./input/tokens"
import { useWide } from "./input/useWide"
import { TABS_H } from "./ConferenceTabs"
import {
  Chip,
  ChipCount,
  EditedMark,
  OUTCOMES,
  OutcomeChip,
  OutcomeFilter,
  countOutcomes
} from "./ConferenceResolution"
import { Card } from "./styles"
import { CHAMBERS, ConfereeView, DifferenceView, SimilarityView } from "./types"

/** The mockup's card, which keeps its gutters at every width. */
const Frame = styled(Card)`
  --pad-x: 32px;
  padding: 24px 32px 32px 34px;
`

/** The heading holds under the tabs while the section scrolls, on a white
 * band run out to the card's edges so what passes under it is covered. */
const HeadingBand = styled.div`
  position: sticky;
  top: calc(var(--maple-navbar-height) + var(--title-h, 5rem) + ${TABS_H});
  z-index: 9;
  margin: -12px calc(-1 * var(--pad-x));
  padding: 12px var(--pad-x);
  background: var(--maple-surface-base);
  border-radius: var(--maple-radius-xl) var(--maple-radius-xl) 0 0;
`

const Heading = styled.h2`
  position: relative;
  left: -4px;
  margin: 0;
  font-family: var(--maple-font-heading);
  font-weight: 400;
  font-size: 1.25rem;
  line-height: 1.4;
  color: ${ink.strong};
  text-wrap: balance;

  @media (min-width: 992px) {
    font-size: 1.375rem;
  }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-top: 24px;

  @media (min-width: 640px) {
    gap: 40px;
  }
`

/** A short paragraph on what the bills are, with the invitation to send
 * feedback under it. */
const Gist = styled.div`
  margin: 0 0 2px;
  padding-left: 16px;
  border-left: 2px solid ${line.strong};
  max-width: 65ch;

  p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.65;
    color: ${ink.mid};
  }
  /* The feedback line beneath the gist. */
  > div + p {
    margin-top: 8px;
    font-size: 0.8125rem;
    color: ${ink.faint};
  }
`

/** The gist's own text, written as markdown, so its paragraphs are told
 * apart from the feedback line. */
const GistText = styled.div`
  p + p {
    margin-top: 8px;
  }
`

const DottedLink = styled.a`
  font-weight: 600;
  color: var(--maple-brand-primary);
  text-decoration: underline dotted;
  text-underline-offset: 4px;
  &:hover {
    color: ${brand.fill};
  }
`

const Grid = styled.div<{ $wide: boolean }>`
  display: grid;
  gap: 32px 80px;
  align-items: start;
  ${({ $wide }) =>
    $wide && "grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);"}
`

const List = styled.ul<{ $gap: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap}px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
`

/** The SENATE and HOUSE labels' small caps, for a column. */
const Label = styled.p`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${ink.mid};
`

const Count = styled.span`
  font-variant-numeric: tabular-nums;
  color: ${ink.faint};
`

/** Turned a quarter by the toggle it sits in, once that is open. */
const Chevron = styled.span`
  display: flex;
  flex-shrink: 0;
  transition: transform 150ms;
  [aria-expanded="true"] > &,
  [aria-expanded="true"] > * > & {
    transform: rotate(90deg);
  }
`

/** A point's heading, pressed to open its two texts. The chevron carries the
 * hover; the words stay as they are. */
const Toggle = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  margin: -4px -8px;
  padding: 4px 8px;
  background: none;
  border: 0;
  border-radius: 8px;
  text-align: left;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.35;
  color: ${ink.strong};

  ${Chevron} {
    margin-top: 1px;
    color: ${ink.faint};
  }
  &:hover ${Chevron} {
    color: ${ink.strong};
  }
`

const Answers = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 14px;

  @media (min-width: 390px) {
    padding-left: 27px;
  }
`

/** Each chamber's text on its own surface, outlined in the chamber's ink. */
const Answer = styled.div<{ $ink: string; $silent?: boolean }>`
  flex: 1 1 0;
  min-width: 0;
  padding: 16px;
  background: var(--maple-surface-base);
  border: 1px
    ${({ $silent, $ink }) =>
      $silent ? `dashed ${line.strong}` : `solid ${$ink}`};
  border-radius: var(--maple-radius-xl);
`

const Chamber = styled(Label)<{ $ink: string }>`
  color: ${({ $ink }) => $ink};
`

/** Faint italic is for the bare fallback alone: an absence, not content. */
const AnswerText = styled.p<{ $absent: boolean }>`
  margin: 2px 0 0;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: ${({ $absent }) => ($absent ? ink.faint : ink.strong)};
  font-style: ${({ $absent }) => ($absent ? "italic" : "normal")};

  @media (min-width: 390px) {
    font-size: 0.875rem;
  }
`

/** A resolved question's heading, with how it was resolved under it and its
 * outcome beside, falling below on a narrow screen. */
const ToggleHead = styled.span`
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px 16px;
  min-width: 0;
`

const ToggleText = styled.span`
  display: flex;
  flex: 1 1 320px;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

const ResolutionLine = styled.span`
  max-width: 72ch;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.5;
  color: ${ink.mid};
`

const OutcomeMarks = styled.span`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

/** A resolved question opened: the two bills, then the law, then why it
 * matters. */
const Opened = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 14px;

  @media (min-width: 390px) {
    padding-left: 27px;
  }
  & > ${Answers} {
    margin: 0;
    padding: 0;
  }
`

/** The law's card, beside the bills' in shape. */
const Law = styled(Answer)`
  flex: none;
  background: ${lawInk.tint};
`

const LawLabel = styled(Label)`
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 4px;
  color: ${lawInk.fill};
`

const Why = styled.p`
  margin: 0;
  padding: 12px 14px;
  font-size: 0.875rem;
  line-height: 1.55;
  color: ${ink.strong};
  background: ${wash.default};
  border-radius: 12px;
`

/** A span rather than a button, so a term of several words breaks across
 * lines like the sentence around it. */
const TermText = styled.span`
  position: relative;
  cursor: default;
  text-decoration: underline dotted ${line.strong};
  text-underline-offset: 4px;
`

const Note = styled.span<{ $up: boolean }>`
  position: absolute;
  left: 0;
  ${({ $up }) =>
    $up ? "bottom: 100%; margin-bottom: 8px;" : "top: 100%; margin-top: 8px;"}
  z-index: 80;
  display: block;
  width: 320px;
  max-width: 80vw;
  padding: 14px;
  background: var(--maple-surface-base);
  border: 1px solid ${line.strong};
  border-radius: 8px;
  box-shadow: ${shadow.popover};
  pointer-events: none;
  text-align: left;
  font-style: normal;
`

const NoteTitle = styled(Label).attrs({ as: "span" })`
  margin-bottom: 8px;
  letter-spacing: 0.07em;
`

const NoteLine = styled.span`
  display: flex;
  gap: 8px;
  margin-top: 6px;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: ${ink.strong};
  &:first-of-type {
    margin-top: 0;
  }
`

const Yours = styled.p`
  margin: 48px 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: ${ink.strong};

  & > svg {
    display: inline;
    vertical-align: -2px;
    margin-right: 8px;
    color: ${caution};
  }
`

const ShareLink = styled.button`
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 0;
  background: none;
  border: 0;
  font-weight: 600;
  color: ${brand.ink};
  text-decoration: underline dotted;
  text-underline-offset: 4px;
  &:hover {
    color: ${brand.fill};
  }
  svg {
    align-self: center;
    margin: 0;
    color: currentColor;
  }
`

const OnRecord = styled.span`
  font-weight: 600;
  color: ${positive};
`

const RowToggle = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
  padding: 5px 0;
  background: none;
  border: 0;
  text-align: left;
  /* The mockup's buttons are medium, and the title takes it. */
  font-weight: 500;

  ${Chevron} {
    margin-top: 2px;
    color: ${line.strong};
  }
  &:hover ${Chevron} {
    color: ${ink.faint};
  }
`

const Marks = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: flex-start;
  gap: 10px;
`

const Tick = styled.span`
  display: flex;
  justify-content: center;
  width: 18px;
  margin-top: 3px;
  color: ${yea};
`

const RowTitle = styled.span`
  flex: 1 1 auto;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: ${ink.strong};
`

const RowBody = styled.p`
  margin: 0;
  padding: 0 0 12px 49px;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: ${ink.mid};
`

/** The groups a resolved conference's questions fall in: which chambers'
 * bills took each one up. */
const GROUPS = ["both", "house", "senate", "neither"] as const

const Sub = styled.p`
  margin: -12px 0 0;
  max-width: 68ch;
  font-size: 0.875rem;
  line-height: 1.6;
  color: ${ink.mid};
`

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`

const FiltersLabel = styled.span`
  margin-right: 4px;
  font-size: 0.8125rem;
  color: ${ink.mid};
`

const Group = styled.section`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const GroupHead = styled.div`
  h3 {
    margin: 0;
    font-family: var(--maple-font-heading);
    font-weight: 500;
    font-size: 1.0625rem;
    color: ${ink.strong};
  }
  p {
    margin: 2px 0 0;
    max-width: 70ch;
    font-size: 0.875rem;
    color: ${ink.mid};
  }
`

const KeptChip = styled(Chip)`
  color: ${yea};
  background: ${keptTint};
`

const Settled = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 12px;
    align-items: start;
    padding-block: 12px;
    border-top: 1px solid ${line.default};
  }
  li:first-child {
    border-top: 0;
  }
`

const SettledWhat = styled.span`
  display: block;
  font-weight: 600;
  font-size: 0.9375rem;
  color: ${ink.strong};
`

const SettledNote = styled.span`
  display: block;
  font-size: 0.875rem;
  line-height: 1.55;
  color: ${ink.mid};
`

/**
 * What the two chambers still disagree on, with the points where their texts
 * already match beside it: written by people, set out as the mockup's "What
 * needs to be resolved?". Left out where a conference has neither.
 */
export function ConferenceDifferences({
  gist,
  differences,
  similarities,
  conferees,
  onShare,
  posted,
  resolved,
  filter,
  onFilter
}: {
  gist: string | null
  differences: DifferenceView[]
  similarities: SimilarityView[]
  conferees: ConfereeView[]
  /** Offered beside the reader's own legislator while input is taken. */
  onShare?: () => void
  /** The reader is already on the record. */
  posted: boolean
  /** Once the report is filed: the questions say how the law resolved them,
   * and which to show is shared with the resolution's bar. */
  resolved: boolean
  filter: OutcomeFilter
  onFilter: (f: OutcomeFilter) => void
}) {
  const { t } = useTranslation("conferences")
  const body = useRef<HTMLDivElement>(null)
  // The mockup's container query: below 720px the matches are left out.
  const wide = useWide(body, 720)
  const yours = (
    <YourLegislators conferees={conferees} onShare={onShare} posted={posted} />
  )

  return (
    <Frame aria-labelledby="decided-q">
      <HeadingBand>
        <Heading id="decided-q">
          {t(resolved ? "resolved.list_title" : "decided.title")}
        </Heading>
      </HeadingBand>
      <Body ref={body}>
        {gist && (
          <Gist>
            <GistText>
              <ReactMarkdown
                components={{
                  a: ({ node: _node, ...props }) => (
                    <DottedLink
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  )
                }}
              >
                {gist}
              </ReactMarkdown>
            </GistText>
            <p>
              <Trans
                t={t}
                i18nKey="decided.gist"
                components={[
                  <DottedLink
                    key="feedback"
                    href={FEEDBACK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ]}
              />
            </p>
          </Gist>
        )}
        {resolved ? (
          <Resolved
            differences={differences}
            similarities={similarities}
            filter={filter}
            onFilter={onFilter}
            yours={yours}
          />
        ) : (
          <Grid $wide={wide}>
            <div>
              <List $gap={26} aria-label={t("decided.differ")}>
                {differences.map((d, i) => (
                  <Difference key={d.heading} d={d} defaultOpen={i === 0} />
                ))}
              </List>
              {yours}
            </div>
            {wide && similarities.length > 0 && (
              <div>
                <Label>
                  {t("decided.match")}
                  <Count>{similarities.length}</Count>
                </Label>
                <List $gap={2}>
                  {similarities.map(s => (
                    <Similarity key={s.heading} s={s} />
                  ))}
                </List>
              </div>
            )}
          </Grid>
        )}
      </Body>
    </Frame>
  )
}

function Difference({
  d,
  defaultOpen
}: {
  d: DifferenceView
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <li>
      <Toggle aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Chevron>
          <ChevronRight size={19} />
        </Chevron>
        <span>{d.heading}</span>
      </Toggle>
      {open && <ChamberAnswers d={d} />}
    </li>
  )
}

/** Each chamber's text in its own card. A chamber whose bill was silent is
 * drawn as an absence, even where its text says what it lacked. */
function ChamberAnswers({ d }: { d: DifferenceView }) {
  const { t } = useTranslation("conferences")
  const { addressedBy } = d
  return (
    <Answers>
      {CHAMBERS.map(chamber => {
        const key = chamber === "Senate" ? "senate" : "house"
        const text = d[key]
        // Before a report nothing says which bills took a question up.
        const absent =
          !!addressedBy && addressedBy !== "both" && addressedBy !== key
        return (
          <Answer key={chamber} $ink={chamberInk[chamber]} $silent={absent}>
            <Chamber $ink={absent ? ink.mid : chamberInk[chamber]}>
              {t(key)}
            </Chamber>
            <AnswerText $absent={!text}>
              {text ? (
                <Marked text={text} notes={d.notes} />
              ) : (
                t("decided.not_in_bill")
              )}
            </AnswerText>
          </Answer>
        )
      })}
    </Answers>
  )
}

/** A question the law has resolved: how, under its heading, and opened, the
 * two bills, the law and why it matters. */
function ResolvedDifference({ d }: { d: DifferenceView }) {
  const { t } = useTranslation("conferences")
  const [open, setOpen] = useState(false)
  const { outcome } = d
  if (!outcome) return null
  return (
    <li>
      <Toggle aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Chevron>
          <ChevronRight size={19} />
        </Chevron>
        <ToggleHead>
          <ToggleText>
            <span>{d.heading}</span>
            {d.resolution && <ResolutionLine>{d.resolution}</ResolutionLine>}
          </ToggleText>
          <OutcomeMarks>
            <OutcomeChip o={outcome} />
            {d.edited && (
              <EditedMark>
                {t("resolved.edited_note", { note: d.edited })}
              </EditedMark>
            )}
          </OutcomeMarks>
        </ToggleHead>
      </Toggle>
      {open && (
        <Opened>
          <ChamberAnswers d={d} />
          {d.law && (
            <Law $ink={lawInk.fill}>
              <LawLabel>
                <span>{t("resolved.law")}</span>
                <OutcomeChip o={outcome} />
              </LawLabel>
              <AnswerText $absent={false}>{d.law}</AnswerText>
            </Law>
          )}
          {d.why && (
            <Why>
              <strong>{t("resolved.why")}</strong> {d.why}
            </Why>
          )}
        </Opened>
      )}
    </li>
  )
}

/** A resolved conference's questions: filtered by outcome, grouped by which
 * bills took them up, with what both passed and the law kept below. */
function Resolved({
  differences,
  similarities,
  filter,
  onFilter,
  yours
}: {
  differences: DifferenceView[]
  similarities: SimilarityView[]
  filter: OutcomeFilter
  onFilter: (f: OutcomeFilter) => void
  yours: JSX.Element
}) {
  const { t } = useTranslation("conferences")
  const counts = countOutcomes(differences)
  const shown = differences.filter(
    d => filter === "all" || d.outcome === filter
  )
  return (
    <>
      <Sub>{t("resolved.list_sub")}</Sub>
      <Filters role="group" aria-label={t("resolved.filters")}>
        <FiltersLabel>{t("resolved.show")}</FiltersLabel>
        <Chip
          as="button"
          type="button"
          aria-pressed={filter === "all"}
          onClick={() => onFilter("all")}
        >
          {t("resolved.all")} <ChipCount>{differences.length}</ChipCount>
        </Chip>
        {OUTCOMES.filter(o => counts[o]).map(o => (
          <OutcomeChip
            key={o}
            o={o}
            count={counts[o]}
            pressed={filter === o}
            onClick={() => onFilter(o)}
          />
        ))}
      </Filters>
      {GROUPS.map(g => {
        const items = shown.filter(d => d.addressedBy === g)
        if (!items.length) return null
        return (
          <Group key={g} aria-labelledby={`group-${g}`}>
            <GroupHead>
              <h3 id={`group-${g}`}>
                {t(`resolved.group.${g}.title`)} <Count>({items.length})</Count>
              </h3>
              <p>{t(`resolved.group.${g}.note`)}</p>
            </GroupHead>
            <List $gap={26}>
              {items.map(d => (
                <ResolvedDifference key={d.heading} d={d} />
              ))}
            </List>
          </Group>
        )
      })}
      {yours}
      {similarities.length > 0 && (
        <div>
          <GroupHead>
            <h3>{t("resolved.settled")}</h3>
            <p>{t("resolved.settled_note")}</p>
          </GroupHead>
          <Settled>
            {similarities.map(s => (
              <li key={s.heading}>
                <KeptChip>{t("resolved.kept")}</KeptChip>
                <span>
                  <SettledWhat>{s.heading}</SettledWhat>
                  <SettledNote>{s.body}</SettledNote>
                </span>
              </li>
            ))}
          </Settled>
        </div>
      )}
    </>
  )
}

/** The text, with each phrase that carries a note made into a term. */
function Marked({
  text,
  notes
}: {
  text: string
  notes: Record<string, string[]>
}) {
  const terms = Object.keys(notes).filter(k => text.includes(k))
  if (!terms.length) return <>{text}</>
  const escaped = terms.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const parts = text.split(new RegExp(`(${escaped.join("|")})`))
  return (
    <>
      {parts.map((part, i) =>
        terms.includes(part) ? (
          <Term key={i} label={part} note={notes[part]} />
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  )
}

/** The height a note can take at its widest, plus its gap. */
const NOTE_H = 380

function Term({ label, note }: { label: string; note: string[] }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [up, setUp] = useState(false)
  const show = () => {
    const r = ref.current?.getBoundingClientRect()
    if (r) {
      const below = window.innerHeight - r.bottom
      setUp(below < NOTE_H && r.top > below)
    }
    setOpen(true)
  }
  const key = (e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false)
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      open ? setOpen(false) : show()
    }
  }
  return (
    <TermText
      ref={ref}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onPointerEnter={show}
      onPointerLeave={() => setOpen(false)}
      onFocus={show}
      onBlur={() => setOpen(false)}
      onKeyDown={key}
    >
      {label}
      {open && (
        <Note role="tooltip" $up={up}>
          <NoteTitle>{label}</NoteTitle>
          {note.map(n => (
            <NoteLine key={n}>
              <span aria-hidden style={{ color: ink.faint }}>
                &bull;
              </span>
              <span>{n}</span>
            </NoteLine>
          ))}
        </Note>
      )}
    </TermText>
  )
}

/** The one line about the reader rather than the bills: one of the people
 * deciding is theirs. */
function YourLegislators({
  conferees,
  onShare,
  posted
}: {
  conferees: ConfereeView[]
  onShare?: () => void
  posted: boolean
}) {
  const { t } = useTranslation("conferences")
  const mine = useMyLegislators()
  const yours = conferees.filter(c => mine.has(c.memberCode))
  if (!yours.length) return null
  return (
    <Yours>
      <Star size={14} fill="currentColor" />
      <span>
        {yours.length > 1 ? (
          <Trans
            t={t}
            i18nKey="decided.yours_both"
            values={{
              a: shortName(yours[0].name),
              b: shortName(yours[1].name)
            }}
            components={[<b key="a" />, <b key="b" />]}
          />
        ) : (
          <Trans
            t={t}
            i18nKey="decided.yours_one"
            values={{
              who: t(yoursKey(yours[0])),
              name: shortName(yours[0].name)
            }}
            components={[<b key="name" />]}
          />
        )}
      </span>{" "}
      {posted ? (
        <OnRecord>{t("input.yours_on_record")}</OnRecord>
      ) : (
        onShare && (
          <ShareLink onClick={onShare}>
            {t("input.share")}
            <ArrowRight size={14} />
          </ShareLink>
        )
      )}
    </Yours>
  )
}

function Similarity({ s }: { s: SimilarityView }) {
  const [open, setOpen] = useState(false)
  return (
    <li>
      <RowToggle aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Marks>
          <Chevron>
            <ChevronRight size={15} />
          </Chevron>
          <Tick>
            <Check size={15} strokeWidth={2.5} />
          </Tick>
        </Marks>
        <RowTitle>{s.heading}</RowTitle>
      </RowToggle>
      {open && <RowBody>{s.body}</RowBody>}
    </li>
  )
}
