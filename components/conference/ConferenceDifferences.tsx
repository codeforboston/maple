import { Fragment, KeyboardEvent, ReactNode, useRef, useState } from "react"
import { DateTime } from "luxon"
import { Trans, useTranslation } from "next-i18next"
import styled from "styled-components"
import { FEEDBACK_URL } from "../common"
import { shortName } from "../formatting"
import { yoursKey } from "./Conferees"
import { useMyLegislators } from "./hooks"
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Star
} from "./input/icons"
import {
  brand,
  caution,
  chamberInk,
  ink,
  line,
  positive,
  red,
  shadow,
  yea
} from "./input/tokens"
import { useWide } from "./input/useWide"
import { TABS_H } from "./ConferenceTabs"
import { CardTitle, CommitteeCard } from "./styles"
import {
  CHAMBERS,
  ConfereeView,
  DifferenceView,
  SimilarityView,
  SourceView
} from "./types"

/** The mockup's card, which keeps its gutters at every width. */
const Frame = styled(CommitteeCard)`
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

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-top: 24px;

  @media (min-width: 640px) {
    gap: 40px;
  }
`

const Gist = styled.p`
  margin: 0 0 2px;
  padding-left: 16px;
  border-left: 2px solid ${line.strong};
  font-size: 0.8125rem;
  line-height: 1.65;
  color: ${ink.mid};
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

/** The SENATE and HOUSE labels' small caps, for a column or the sources. */
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
const Answer = styled.div<{ $ink: string }>`
  flex: 1 1 0;
  min-width: 0;
  padding: 16px;
  background: var(--maple-surface-base);
  border: 1px solid ${({ $ink }) => $ink};
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

/** The mockup's citation mark. */
const Mark = styled.sup`
  margin-left: 1px;
  font-size: 0.55em;
  font-weight: 600;
  color: ${ink.faint};
`

/** The ballot page's bibliography, as the mockup parks it: one sentence per
 * source, the host as the link. */
const Sources = styled.ol`
  margin: 12px 0 0;
  padding-left: 20px;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: ${ink.strong};

  li + li {
    margin-top: 8px;
  }
  li::marker {
    color: ${ink.faint};
  }
  a {
    display: inline-flex;
    align-items: baseline;
    gap: 3px;
    color: ${brand.fill};
    text-decoration: underline;
    text-underline-offset: 3px;
    &:hover {
      color: ${red.hover};
    }
  }
  svg {
    align-self: center;
  }
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
  posted
}: {
  gist: string | null
  differences: DifferenceView[]
  similarities: SimilarityView[]
  conferees: ConfereeView[]
  /** Offered beside the reader's own legislator while input is taken. */
  onShare?: () => void
  /** The reader is already on the record. */
  posted: boolean
}) {
  const { t } = useTranslation("conferences")
  const body = useRef<HTMLDivElement>(null)
  // The mockup's container query: below 720px the matches are left out.
  const wide = useWide(body, 720)
  const cited = sourcesOf([...differences, ...(wide ? similarities : [])])
  const markFor = (s: SourceView | null) => {
    const n = s ? cited.findIndex(c => c.url === s.url) + 1 : 0
    return n ? <Mark>{n}</Mark> : null
  }

  return (
    <Frame aria-labelledby="decided-q">
      <HeadingBand>
        <CardTitle id="decided-q" className="mb-0">
          {t("decided.title")}
        </CardTitle>
      </HeadingBand>
      <Body ref={body}>
        {gist && (
          <Gist>
            {gist}{" "}
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
          </Gist>
        )}
        <Grid $wide={wide}>
          <div>
            <List $gap={26} aria-label={t("decided.differ")}>
              {differences.map((d, i) => (
                <Difference
                  key={d.heading}
                  d={d}
                  mark={markFor(d.source)}
                  defaultOpen={i === 0}
                />
              ))}
            </List>
            <YourLegislators
              conferees={conferees}
              onShare={onShare}
              posted={posted}
            />
          </div>
          {wide && similarities.length > 0 && (
            <div>
              <Label>
                {t("decided.match")}
                <Count>{similarities.length}</Count>
              </Label>
              <List $gap={2}>
                {similarities.map(s => (
                  <Similarity key={s.heading} s={s} mark={markFor(s.source)} />
                ))}
              </List>
            </div>
          )}
        </Grid>
        {cited.length > 0 && (
          <div>
            <Label>{t("decided.sources")}</Label>
            <Sources>
              {cited.map(s => (
                <Source key={s.url} source={s} />
              ))}
            </Sources>
          </div>
        )}
      </Body>
    </Frame>
  )
}

/** Each source once, in the order the points first cite it. */
const sourcesOf = (points: { source: SourceView | null }[]) => [
  ...new Map(
    points.flatMap(p => (p.source ? [[p.source.url, p.source] as const] : []))
  ).values()
]

function Difference({
  d,
  mark,
  defaultOpen
}: {
  d: DifferenceView
  mark: ReactNode
  defaultOpen: boolean
}) {
  const { t } = useTranslation("conferences")
  const [open, setOpen] = useState(defaultOpen)
  return (
    <li>
      <Toggle aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Chevron>
          <ChevronRight size={19} />
        </Chevron>
        <span>
          {d.heading}
          {mark}
        </span>
      </Toggle>
      {open && (
        <Answers>
          {CHAMBERS.map(chamber => {
            const key = chamber === "Senate" ? "senate" : "house"
            const text = d[key]
            return (
              <Answer key={chamber} $ink={chamberInk[chamber]}>
                <Chamber $ink={chamberInk[chamber]}>{t(key)}</Chamber>
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
      )}
    </li>
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

function Similarity({ s, mark }: { s: SimilarityView; mark: ReactNode }) {
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
        <RowTitle>
          {s.heading}
          {mark}
        </RowTitle>
      </RowToggle>
      {open && <RowBody>{s.body}</RowBody>}
    </li>
  )
}

function Source({ source }: { source: SourceView }) {
  const { t } = useTranslation("conferences")
  return (
    <li>
      <em>{source.organisation}</em>
      {source.publishedAt && `, ${published(source.publishedAt)}`}.{" "}
      {t("decided.available")}{" "}
      <a href={source.url} target="_blank" rel="noopener noreferrer">
        {new URL(source.url).hostname.replace(/^www\./, "")}
        <ArrowUpRight size={12} />
      </a>
    </li>
  )
}

/** An ISO date as the citation prints it: "Sep 1, 2026". */
const published = (iso: string) =>
  DateTime.fromISO(iso, { zone: "utc" }).toLocaleString(DateTime.DATE_MED)
