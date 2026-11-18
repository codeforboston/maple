import { useTranslation } from "next-i18next"
import { ReactNode, useState } from "react"
import styled from "styled-components"
import { useAuth } from "components/auth"
import {
  ConferenceTestimony,
  ProfileMember,
  useMember,
  useProfile
} from "components/db"
import { useLetterOnRecord } from "components/db/legislatorMail"
import {
  ConferencePosition,
  hasLegislators,
  Letter,
  LetterMember,
  renderLetter
} from "functions/src/conferenceLetters/letter"
import { ConfereeFace } from "../Conferees"
import { useMyLegislators } from "../hooks"
import { ConfereeView } from "../types"
import { Entry } from "./Entry"
import { CalendarDays, CircleCheck, Globe, Info, Mail, Send } from "./icons"
import { brand, ink, line, sunken, wash } from "./tokens"

const Heading = styled.p`
  margin: 0 0 10px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${ink.mid};
`

const Goes = styled.ul`
  list-style: none;
  margin: 0 0 22px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

/** One place the input goes (Place): the icon and the words, in the type of
 * the mockup's weekly-email row (DigestChoice in its compose.tsx). The icon
 * sits on the title's line. */
const PlaceRow = styled.li`
  display: grid;
  grid-template-columns: 17px minmax(0, 1fr);
  column-gap: 12px;
  align-items: start;
  font-family: var(--maple-font-body);
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.45;
  color: ${ink.strong};

  /* The row's own icon, centred on the title's line, in the panel's blue
     softened; not those inside the row, such as a legislator's star. */
  > svg {
    margin-top: 2px;
    color: ${brand.ink};
    opacity: 0.75;
  }
`

/** A line more under the title, lighter than it. */
const Detail = styled.span`
  display: block;
  margin-top: 2px;
  font-weight: 300;
  font-size: 0.8125rem;
  color: ${ink.mid};
`

/** In a preview well's foot (WellFoot): who it goes to, the words just
 * before the photos, the two together at the right. */
const AudienceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  font-size: 0.8125rem;
  color: ${ink.mid};
`

const Photos = styled.div`
  display: flex;
  padding-left: 3px;
`

/** Each photo (ConfereeFace), 20px, a little over the last, edged in the
 * well's grey (sunken) so the overlaps read as cut out of it. The reader's
 * own legislator's star (ConfereeFace's, the one span with a label) at the
 * mockup's size: an 8px star in a 12px circle, 1px out from the photo's
 * corner. */
const Photo = styled.span`
  margin-left: -3px;

  img {
    box-shadow: 0 0 0 2px ${sunken};
  }
  span[aria-label] {
    width: 12px;
    height: 12px;
    right: -1px;
    bottom: -1px;
    font-size: 8px;
  }
`

/** One place the input goes, in Delivery's list: what happens (`title`) and
 * any lines more (`details`). */
function Place({
  icon,
  title,
  details = []
}: {
  icon: ReactNode
  title: ReactNode
  details?: ReactNode[]
}) {
  return (
    <PlaceRow>
      {icon}
      <div>
        {title}
        {details.filter(Boolean).map((detail, i) => (
          <Detail key={i}>{detail}</Detail>
        ))}
      </div>
    </PlaceRow>
  )
}

/** Where it goes in words, in the place of the photos: the input on MAPLE,
 * public. */
/** The On MAPLE preview's foot: going to the public, on MAPLE. */
function PublicAudience() {
  const { t } = useTranslation("conferences")
  return (
    <AudienceRow>
      {t("review.going_public")}
      <Globe size={16} strokeWidth={1.8} />
    </AudienceRow>
  )
}

/** Who a preview goes to (Previews), by their photos, the reader's own
 * legislators last and starred; `label` says who they are to a screen
 * reader. */
function Audience({
  people,
  label
}: {
  people: ConfereeView[]
  label: string
}) {
  const { t } = useTranslation("conferences")
  const mine = useMyLegislators()
  const ordered = [...people].sort(
    (a, b) => Number(mine.has(a.memberCode)) - Number(mine.has(b.memberCode))
  )
  return (
    <AudienceRow>
      {t("review.goes_to")}
      <Photos role="img" aria-label={label}>
        {ordered.map(c => (
          <Photo key={c.memberCode}>
            <ConfereeFace
              c={c}
              size={20}
              own={mine.has(c.memberCode)}
              labelled
            />
          </Photo>
        ))}
      </Photos>
    </AudienceRow>
  )
}

/** Around the input as MAPLE will show it (SitePreview), as the review step
 * drew it before the email preview came in. */
const PreviewBox = styled.div`
  background: var(--maple-surface-base);
  border: 1px solid ${line.default};
  border-radius: 16px;
`

/** The input as it will look on MAPLE: the conference's own entry card, its
 * edge the box's. */
export function SitePreview({ testimony }: { testimony: ConferenceTestimony }) {
  return (
    <PreviewBox>
      <Entry testimony={testimony} bare />
    </PreviewBox>
  )
}

/** Which preview shows (Previews), across the panel: the panel's wash for
 * the track, the one showing in white on it. */
const Switch = styled.div`
  display: flex;
  margin-bottom: 10px;
  padding: 2px;
  border-radius: 8px;
  background: ${wash.strong};
`

/** Each the same width, whatever its label, the label centred both ways and
 * wrapping where it must, and where its text breaks (Weekly / Email). */
const SwitchOption = styled.button`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  border: 0;
  /* The track's corner (Switch) less its 2px padding, so the two curves run
     alike. */
  border-radius: 6px;
  background: none;
  font-family: var(--maple-font-body);
  font-size: 0.8125rem;
  line-height: 1.3;
  text-align: center;
  white-space: pre-line;
  color: ${ink.mid};
  cursor: pointer;

  &[aria-pressed="true"] {
    background: var(--maple-surface-base);
    font-weight: 600;
    color: ${ink.strong};
  }
  &:focus-visible {
    outline: 2px solid var(--maple-focus-ring);
    outline-offset: 1px;
  }
`

/** The previews' well, recessed as the bill text's is (ConferenceText.tsx).
 * It fills the panel down to its buttons, never less than 240px (below
 * that the panel scrolls), and the preview scrolls inside it, as the bill
 * text scrolls in its own. */
const Well = styled.div`
  /* From nothing, taking what the panel has left: its preview's height
     never pushes the panel itself to scroll. */
  flex: 1 1 0;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${sunken};
  border: 1px solid var(--maple-surface-border);
  border-radius: 5px;
`

/** What scrolls in the well: the white preview alone. It doesn't spring past
 * its ends (overscroll-behavior), so the well holds still while the preview
 * moves in it. */
const WellScroll = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: none;
  padding: 12px 12px 0;
`

/** Who the preview goes to, at the well's foot, outside what scrolls, so it
 * stays where it is as the preview moves above it. */
const WellFoot = styled.div`
  flex: none;
  padding: 10px 12px 12px;
  background: ${sunken};
`

/** In a well with no preview yet (the weekly update's): centred in it,
 * muted. */
const Soon = styled.p`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  font-size: 0.8125rem;
  color: ${ink.mid};
`

type View = "web" | "weekly" | "email"

/** The input as it will look: on MAPLE (`web`), in the weekly update, and
 * in the email to the reader's legislators (`email`), one at a time in the
 * well, with a switch between those there are, and who each goes to pinned
 * at the well's foot. A reader MAPLE can't email for has no email preview.
 * It opens on the input on MAPLE, else the email, never on the weekly update
 * while that is blank. */
function Previews({
  web,
  email,
  conferees,
  legislators
}: {
  web?: ReactNode
  email?: ReactNode
  /** Who the weekly update goes to. */
  conferees: ConfereeView[]
  /** Who the email goes to, and who they are, for a screen reader. */
  legislators: { people: ConfereeView[]; label: string }
}) {
  const { t } = useTranslation("conferences")
  const views = (["web", "weekly", "email"] as View[]).filter(v =>
    v === "web" ? !!web : v === "email" ? !!email : true
  )
  const [picked, setPicked] = useState<View>()
  const showing: View =
    picked && views.includes(picked)
      ? picked
      : web
      ? "web"
      : email
      ? "email"
      : "weekly"
  if (!web && !email) return null
  const body: Record<View, ReactNode> = {
    web,
    // The weekly update's preview, to come.
    weekly: <Soon>{t("review.preview_weekly_soon")}</Soon>,
    email
  }
  const foot: Record<View, ReactNode> = {
    web: <PublicAudience />,
    weekly: <Audience people={conferees} label={t("review.conferees_label")} />,
    email: <Audience people={legislators.people} label={legislators.label} />
  }
  return (
    <>
      <Heading>{t("input.preview_label")}</Heading>
      {views.length > 1 && (
        <Switch role="group" aria-label={t("input.preview_label")}>
          {views.map(v => (
            <SwitchOption
              key={v}
              type="button"
              aria-pressed={showing === v}
              onClick={() => setPicked(v)}
            >
              {t(`review.preview_${v}`)}
            </SwitchOption>
          ))}
        </Switch>
      )}
      <Well>
        {/* Keyed so each preview opens scrolled to its top. */}
        <WellScroll key={showing}>{body[showing]}</WellScroll>
        <WellFoot>{foot[showing]}</WellFoot>
      </Well>
    </>
  )
}

const Message = styled.div`
  padding: 14px 16px;
  background: var(--maple-surface-base);
  border: 1px solid ${line.default};
  border-radius: 8px;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: ${ink.midheavy};
  /* A long unbroken run, in the reader's words or an address, wraps in the
     letter rather than running out of it. */
  overflow-wrap: anywhere;
  p {
    margin: 0 0 10px;
  }
`

const Headers = styled.dl`
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 4px 12px;
  margin: 0 0 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${line.default};
  dt {
    font-weight: 400;
    color: ${ink.mid};
  }
  dd {
    margin: 0;
    color: ${ink.strong};
    overflow-wrap: anywhere;
  }
`

const Quote = styled.blockquote`
  margin: 0 0 12px;
  padding: 2px 0 2px 14px;
  border-left: 3px solid ${brand.edge};
  p {
    margin-bottom: 6px;
  }
`

const Foot = styled.p`
  && {
    margin: 0;
    font-size: 0.75rem;
    color: ${ink.mid};
  }
`

/** Under the cosign's card in the On MAPLE well, in the well's grey. */
const WellNote = styled.p`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 12px 0 0;
  padding: 0 8px;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: ${ink.mid};
  svg {
    flex: none;
    margin-top: 2px;
  }
  button {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    font-weight: 700;
    color: ${brand.fill};
    text-decoration: underline;
  }
`

/** What a cosign without words of its own says to its reader, under its
 * card: it still counts, and a line would carry more weight. */
export function NoLine({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation("conferences")
  return (
    <WellNote>
      <Send size={16} />
      <span>
        {t("review.no_line")}{" "}
        <button type="button" onClick={onAdd}>
          {t("review.add_line")}
        </button>
      </span>
    </WellNote>
  )
}

/** What every cosign says to its reader, under its card: it is their one
 * input on the conference. */
export function CountsOnce() {
  const { t } = useTranslation("conferences")
  return (
    <WellNote>
      <Info size={16} />
      <span>{t("review.counts_once")}</span>
    </WellNote>
  )
}

/** What input says to its reader, under its card: once posted it stays on
 * the record, revised or not. */
export function OnRecord() {
  const { t } = useTranslation("conferences")
  return (
    <WellNote>
      <Info size={16} />
      <span>{t("review.on_record")}</span>
    </WellNote>
  )
}

/** The reader's rep and senator as the letter names them: the member
 * documents' own name and district, so a renamed district isn't stale, and
 * what the profile holds until they load. */
export function useLegislators(court: number) {
  const { profile } = useProfile()
  const rep = useMember(court, profile?.representative?.id).member
  const sen = useMember(court, profile?.senator?.id).member
  const named = (
    held: ProfileMember | undefined,
    doc: typeof rep
  ): LetterMember | undefined =>
    held && {
      name: doc?.Name ?? held.name,
      district: doc?.District ?? held.district
    }
  /** For their photos (Place), drawn as the conferees are. */
  const face = (
    held: ProfileMember | undefined,
    doc: typeof rep,
    branch: ConfereeView["branch"]
  ): ConfereeView[] =>
    held
      ? [
          {
            memberCode: held.id,
            branch,
            chair: false,
            name: doc?.Name ?? held.name,
            party: doc?.Party ?? "",
            district: doc?.District ?? held.district,
            seat: null
          }
        ]
      : []
  return {
    representative: named(profile?.representative, rep),
    senator: named(profile?.senator, sen),
    faces: [
      ...face(profile?.representative, rep, "House"),
      ...face(profile?.senator, sen, "Senate")
    ]
  }
}

/**
 * Where conference input goes: public on MAPLE, to the reader's rep and
 * senator, and into the conferees' weekly update. A reader whose profile has
 * neither is told whom MAPLE can't notify, and that only the update counts
 * them.
 */
export function Delivery({
  cosign,
  representative,
  senator
}: {
  /** The name of whoever's input this cosigns. */
  cosign?: string
  representative?: LetterMember
  senator?: LetterMember
}) {
  const { t } = useTranslation("conferences")
  const known = hasLegislators({ representative, senator })
  return (
    <>
      <Heading>
        {t(cosign ? "review.goes_cosign" : "review.goes_input")}
      </Heading>
      <Goes>
        <Place
          icon={<CircleCheck size={17} strokeWidth={1.8} />}
          title={t("review.public_input")}
        />
        <Place
          icon={<CalendarDays size={17} strokeWidth={1.8} />}
          title={t(cosign ? "review.weekly_cosign" : "review.weekly_input")}
        />
        {known ? (
          <Place
            icon={<Mail size={17} strokeWidth={1.8} />}
            title={t("review.emailed")}
          />
        ) : (
          <Place
            icon={<Mail size={17} strokeWidth={1.8} />}
            title={t("review.emailed_none")}
          />
        )}
      </Goes>
    </>
  )
}

/** The letter as it will be sent. */
export function LetterPreview({ letter }: { letter: Letter }) {
  const { t } = useTranslation("conferences")
  return (
    <>
      <Message>
        <Headers>
          <dt>{t("review.from")}</dt>
          <dd>{letter.from}</dd>
          <dt>{t("review.reply_to")}</dt>
          <dd>{letter.replyTo}</dd>
          <dt>{t("review.cc")}</dt>
          <dd>{letter.cc}</dd>
          <dt>{t("review.to")}</dt>
          <dd>{letter.to}</dd>
          <dt>{t("review.subject")}</dt>
          <dd>{letter.subject}</dd>
        </Headers>
        <p>{letter.salutation}</p>
        {letter.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {letter.cosigned && (
          <>
            <p>
              <strong>{letter.cosigned.lead}</strong>
            </p>
            <Quote>
              {letter.cosigned.quote.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Quote>
          </>
        )}
        <p>
          {letter.signature.map((s, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {s}
            </span>
          ))}
        </p>
        <Foot>{letter.footer}</Foot>
      </Message>
    </>
  )
}

/** The body of a review step: where the input goes (Delivery), then the
 * input as it will look (Previews), the letter among them when MAPLE knows
 * whom to write to. Mounted on the review step alone, so the legislators are
 * read only there. */
export function LetterReview({
  court,
  conferenceId,
  conferees,
  author,
  conference,
  testimonyId,
  position,
  content,
  cosign,
  preview
}: {
  court: number
  conferenceId: string
  /** The conferees, for the weekly update's row. */
  conferees: ConfereeView[]
  author: string
  conference: string
  /** The input the reader posted before, when editing it. The letter is an
   * update when one for it is on record. */
  testimonyId?: string
  position: ConferencePosition
  /** The reader's own words, empty on a cosign without a note. */
  content: string
  /** Whose input this cosigns. */
  cosign?: { author: string; content: string }
  /** How the input will look on MAPLE, under where it goes. */
  preview?: ReactNode
}) {
  const { t } = useTranslation("conferences")
  const { representative, senator, faces } = useLegislators(court)
  const email = useAuth().user?.email ?? ""
  const edited = useLetterOnRecord(testimonyId)
  // Who the letter goes to, for a screen reader: "Rep. A and Sen. B".
  const names = [
    representative && t("review.rep", { name: representative.name }),
    senator && t("review.sen", { name: senator.name })
  ]
    .filter(Boolean)
    .join(t("review.and"))
  return (
    <>
      <Delivery
        cosign={cosign?.author}
        representative={representative}
        senator={senator}
      />
      <Previews
        web={preview}
        conferees={conferees}
        legislators={{ people: faces, label: names }}
        email={
          hasLegislators({ representative, senator }) && (
            <LetterPreview
              letter={renderLetter({
                author,
                email,
                court,
                conferenceId,
                conference,
                edited,
                position,
                content,
                cosign,
                representative,
                senator
              })}
            />
          )
        }
      />
    </>
  )
}
