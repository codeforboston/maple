import { ChangeEvent, useMemo, useState } from "react"
import { BackChevron, BackToConferences } from "./BackToConferences"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Form } from "../bootstrap"
import { Internal, maple } from "../links"
import { Chair, Conferees, ConfereeFace, yoursKey } from "./Conferees"
import { ConferenceTable } from "./ConferenceTable"
import { DistrictMap, seatsOf } from "./DistrictMap"
import { useHover, useMyLegislators } from "./hooks"
import {
  CommitteeCard,
  DottedInternal,
  Eyebrow,
  FULL_LAYOUT,
  MOBILE_LAYOUT,
  PageColumn,
  Title
} from "./styles"
import {
  CHAMBERS,
  conferenceName,
  ConfereeView,
  ConferenceIndexProps,
  ConferenceSummary,
  personKey
} from "./types"

/** What the explorer is holding: one conference (and perhaps one of its six),
 * one legislator, or the reader's own two. */
type Selection =
  | { kind: "conference"; id: string; seat?: string }
  | { kind: "seat"; key: string }
  | { kind: "mine" }
  | null

/** A legislator and every conference they sit on. */
type Sitting = {
  person: ConfereeView
  on: { conference: ConferenceSummary; chair: boolean }[]
}

/** The page's title in Lexend, as the conference page's "Conference
 * Committees" is (ConferenceHero.tsx). Each conference's own title keeps the
 * mockup's bold Nunito. */
const ExplorerTitle = styled(Title)`
  *:root & {
    font-family: var(--maple-font-heading);
  }

  /* In the mobile layout, centred in the row's middle (TitleLine). */
  @media ${MOBILE_LAYOUT} {
    grid-column: 2;
    text-align: center;
  }
`

/** The title, and in the mobile layout the way back before it (BackChevron),
 * standing in for the way back's row (BackToConferences, notMobile). */
const TitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  /* The room the intro left under the title, while the intro is out. */
  margin-bottom: 1rem;

  /* In the mobile layout, as on a committee's page (TitleCell and TitleBand,
     ConferenceDetails.tsx): the title centred across the row, the way back
     at the left (its 26px in the row, the rest over the page's edge,
     BackChevron) and as much room kept empty at the right, so the title's
     middle is the row's; and 1.625rem above it, the room the way back's row
     gives from md up. */
  @media ${MOBILE_LAYOUT} {
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr) 26px;
    gap: 8px;
    padding-top: 1.625rem;
  }
`

/** Widened to 1320 from 992, as the conference page is
 * (ConferenceDetails.tsx). From md up, the back link's row above
 * (BackToConferences) gives the room above the title; in the mobile layout,
 * TitleLine does. */
const Page = styled(PageColumn)`
  padding-top: 0;

  @media (min-width: 992px) {
    max-width: 1320px;
  }
`

/** In the mobile layout, the card says the explorer isn't available, with
 * the way back (Unavailable); from md up, the table and the explorer side by
 * side. Both render so the server's page is the reader's. Conference Home
 * doesn't link here in the mobile layout (ConferenceHero.tsx); this is for a
 * reader who lands here anyway. */
const Narrow = styled.div`
  @media ${FULL_LAYOUT} {
    display: none;
  }
`

/** In the gray of the members' panel (Panel), its words set as the panel's
 * prompt is (Empty). */
const Unavailable = styled.div`
  padding: 2rem 1.25rem;
  background: #f7f7f7;
  border-radius: var(--maple-radius-xl);
  text-align: center;
  font-size: 0.875rem;
  color: var(--maple-text-muted);

  p {
    margin: 0 0 0.75rem;
  }
`

/** The card the table is in, with as much room under the table's last row
 * as above its header: the card's 1.5rem top less the last row's 8px, plus
 * the header's 5px. Only where the table shows (Wide); the box below that
 * (Unavailable) keeps the card's own. */
const ExplorerCard = styled(CommitteeCard)`
  @media ${FULL_LAYOUT} {
    && {
      padding-bottom: calc(1.5rem - 3px);
      /* The card's 2rem at the left from 1200 up, narrowing with the window
         to 1.25rem at 992 and on down, so the room the table needs comes
         from the white at the left of the names (and Wide's). */
      padding-left: clamp(
        1.25rem,
        calc(1.25rem + (100vw - 992px) * 0.0577),
        2rem
      );
    }
  }
`

const Wide = styled.div`
  display: none;

  @media ${FULL_LAYOUT} {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    /* More room between the card's edge and the table: 1rem from 1200 up,
       narrowing with the window to none at 992 (ExplorerCard). */
    padding-left: clamp(0px, calc((100vw - 992px) * 0.0769), 1rem);
  }
`

const Explorer = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  padding-top: 10px;
`

const Panel = styled.div`
  min-height: 258px;
  padding: 1rem 1.25rem;
  background: #f7f7f7;
  border-radius: var(--maple-radius-xl);
  /* A column, so the prompt can centre itself in the room under the heading
     (Empty). */
  display: flex;
  flex-direction: column;
`

const PanelHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`

/** In Nunito, as the mockup sets it, at 500: the site loads Nunito at 500
 * and 700 but not the mockup's 600, which would draw at 700. */
const PanelTitle = styled.h2`
  margin: 0;
  font-family: var(--maple-font-body);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--maple-text-muted);
`

const CommitteeLink = styled(Internal)`
  font-family: "Nunito", var(--bs-body-font-family);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--maple-brand-primary-strong);
  text-decoration: none;
  &:hover {
    color: var(--maple-brand-primary-strong);
    text-decoration: underline;
  }
`

const ClearButton = styled.button`
  padding: 0;
  border: 0;
  background: none;
  font-size: 0.8125rem;
  color: var(--maple-text-muted);
  &:hover {
    color: var(--maple-text-strong);
    text-decoration: underline;
  }
`

/** Centred in the panel under its heading, as the mockup's is. */
const Empty = styled.p`
  margin: auto;
  max-width: 22rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--maple-text-muted);
`

const Chambers = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 17px;
`

/** Side by side whenever the explorer shows. */
const Maps = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  padding-top: 30px;
`

const Below = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem 1.5rem;
  margin-top: 1.5rem;
  font-size: 0.8125rem;
`

/** The reader's own legislators' switch, at the left of the row under the
 * maps (Below). Off, its edge and knob in the muted text's grey
 * (--maple-text-muted), darker than Bootstrap's, which read as disabled; on,
 * green, rather than Bootstrap's primary, which is red here
 * (styles/bootstrap.scss). Bootstrap draws its focus (its red ring, and the
 * knob and edge in its focus blue) on any focus, so it stayed after a click;
 * here the switch keeps its own look on focus, and the keyboard alone gets
 * the site's focus ring. */
const LegislatorsSwitch = styled(Form.Check)`
  && {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 0;
    margin: 0 auto 0 0;
    padding-left: 0;
  }
  && .form-check-input,
  && .form-check-input:focus {
    float: none;
    margin: 0;
    cursor: pointer;
    border-color: var(--maple-text-muted);
    box-shadow: none;
    --bs-form-switch-bg: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%2364748b'/%3e%3c/svg%3e");
  }
  && .form-check-input:checked,
  && .form-check-input:checked:focus {
    background-color: var(--bs-green);
    border-color: var(--bs-green);
    --bs-form-switch-bg: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
  }
  && .form-check-input:focus-visible {
    outline: 3px solid var(--maple-focus-ring);
    outline-offset: 2px;
  }
  && .form-check-label {
    cursor: pointer;
  }
`

const PersonCard = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;

  & + & {
    margin-top: 1.25rem;
  }
  .name {
    font-weight: 600;
    color: var(--maple-text-strong);
  }
  .sub {
    font-size: 0.8125rem;
    color: var(--maple-text-muted);
  }
  ul {
    list-style: none;
    margin: 0.25rem 0 0;
    padding: 0;
    font-size: 0.875rem;
  }
`

/** One legislator in the panel: who they are, and every conference they sit
 * on. */
function Legislator({ sitting, own }: { sitting: Sitting; own: boolean }) {
  const { t } = useTranslation("conferences")
  const { person, on } = sitting
  return (
    <PersonCard>
      <ConfereeFace c={person} size={48} own={own} />
      <div className="min-w-0">
        <div className="name">{person.name}</div>
        {own && <div className="sub">{t(yoursKey(person))}</div>}
        <Eyebrow className="mt-2">{t("office")}</Eyebrow>
        <div className="sub">
          {t(person.branch === "House" ? "office_house" : "office_senate", {
            district: person.district
          })}
        </div>
        <Eyebrow className="mt-2">{t("conference")}</Eyebrow>
        <ul>
          {on.map(({ conference, chair }) => (
            <li key={conference.id}>
              <DottedInternal href={maple.conference(conference)}>
                {conferenceName(conference)}
              </DottedInternal>
              {chair && <Chair>{t("chair")}</Chair>}
            </li>
          ))}
        </ul>
      </div>
    </PersonCard>
  )
}

/**
 * Every conference in the court and everyone sitting on them. The table on
 * the left and the maps on the right answer each other: choose a conference
 * and its six light; choose a seat and the rows that legislator sits on
 * stay. The panel above the maps says who is being read.
 */
export function ConferenceExplorer({
  conferences: allConferences,
  conferees
}: ConferenceIndexProps) {
  const { t } = useTranslation("conferences")
  // Enacted conferences left out, from the table and the maps alike, and
  // those we haven't covered at the bottom, as the rail has them
  // (ConferenceRail).
  const conferences = useMemo(
    () =>
      allConferences
        .filter(c => c.status !== "enacted")
        .sort((a, b) => Number(!a.covered) - Number(!b.covered)),
    [allConferences]
  )
  const mine = useMyLegislators()
  const [selected, setSelected] = useState<Selection>(null)
  // Pointing at a seat paints the maps only; the table and the panel wait
  // for a click.
  const [hoveredSeat, hoverSeat] = useHover<string>()

  // Each legislator once, with the conferences they sit on, by the key the
  // map and the table share.
  const sittings = useMemo(() => {
    const byKey = new Map<string, Sitting>()
    for (const conference of conferences) {
      for (const person of conferees[conference.id] ?? []) {
        const key = personKey(person)
        const sitting = byKey.get(key) ?? { person, on: [] }
        sitting.on.push({ conference, chair: person.chair })
        byKey.set(key, sitting)
      }
    }
    return byKey
  }, [conferences, conferees])
  const everyone = useMemo(
    () => seatsOf([...sittings.values()].map(s => s.person)),
    [sittings]
  )
  const mineSittings = [...sittings.values()].filter(s =>
    mine.has(s.person.memberCode)
  )

  const held =
    selected?.kind === "conference"
      ? conferences.find(c => c.id === selected.id) ?? null
      : null
  const heldConferees = held ? conferees[held.id] ?? [] : []

  // The legislators the panel shows, and the table rings and keeps.
  const shown =
    selected?.kind === "seat"
      ? [sittings.get(selected.key)!]
      : selected?.kind === "mine"
      ? mineSittings
      : null
  const highlighted = shown && new Set(shown.map(s => personKey(s.person)))

  const people = held
    ? seatsOf(heldConferees)
    : selected?.kind === "mine"
    ? seatsOf(mineSittings.map(s => s.person))
    : everyone
  const mapSelected =
    hoveredSeat ??
    (selected?.kind === "conference"
      ? selected.seat ?? null
      : selected?.kind === "seat"
      ? selected.key
      : null)

  const selectRow = (id: string) =>
    setSelected(
      selected?.kind === "conference" && selected.id === id
        ? null
        : { kind: "conference", id }
    )
  // Inside a held conference a seat is one of its six; otherwise it is the
  // legislator to read.
  const pinSeat = (key: string) =>
    setSelected(
      selected?.kind === "conference"
        ? { ...selected, seat: selected.seat === key ? undefined : key }
        : selected?.kind === "seat" && selected.key === key
        ? null
        : { kind: "seat", key }
    )

  // The committees' pages from here: the session's first committee
  // (pages/conferences/[court]), or Conference Home where there are none.
  const committeesHref = allConferences[0]
    ? `${maple.conferences()}/${allConferences[0].court}`
    : maple.conferences()

  return (
    <>
      {/* The way back, in its own row above the page from md up; below
          that, the chevron beside the title (TitleLine). */}
      <BackToConferences notMobile />
      <Page>
        <TitleLine>
          <BackChevron />
          <ExplorerTitle>{t("explorer")}</ExplorerTitle>
        </TitleLine>
        <ExplorerCard>
          <Narrow>
            <Unavailable>
              <p>{t("explorer_unavailable")}</p>
              <Internal href={maple.conferences()}>
                {t("back_to_home")}
              </Internal>
            </Unavailable>
          </Narrow>
          <Wide>
            <ConferenceTable
              conferences={conferences}
              conferees={conferees}
              selected={held?.id ?? null}
              highlighted={highlighted}
              // In a held conference, the legislator pointed at or pinned in
              // the panel or on the maps, ringed in the table, and the other
              // conferences they sit on brought forward.
              ringed={held ? mapSelected : null}
              onSelect={selectRow}
            />
            <Explorer>
              <Panel>
                <PanelHead>
                  {held ? (
                    <CommitteeLink href={maple.conference(held)}>
                      {conferenceName(held)}
                    </CommitteeLink>
                  ) : (
                    <PanelTitle>{t("explorer_panel")}</PanelTitle>
                  )}
                  {selected && (
                    <ClearButton
                      type="button"
                      onClick={() => setSelected(null)}
                    >
                      {t("clear")}
                    </ClearButton>
                  )}
                </PanelHead>
                {held ? (
                  <Chambers onPointerLeave={() => hoverSeat(null)}>
                    {CHAMBERS.map(chamber => (
                      <Conferees
                        key={chamber}
                        court={held.court}
                        chamber={chamber}
                        conferees={heldConferees}
                        mine={mine}
                        selected={mapSelected}
                        onHover={hoverSeat}
                        onPin={pinSeat}
                      />
                    ))}
                  </Chambers>
                ) : shown?.length ? (
                  shown.map(s => (
                    <Legislator
                      key={s.person.memberCode}
                      sitting={s}
                      own={mine.has(s.person.memberCode)}
                    />
                  ))
                ) : (
                  <Empty>{t(shown ? "mine_none" : "explorer_empty")}</Empty>
                )}
              </Panel>
              <Maps>
                {CHAMBERS.map(chamber => (
                  <DistrictMap
                    key={chamber}
                    chamber={chamber}
                    people={people}
                    selected={mapSelected}
                    onHover={hoverSeat}
                    onPin={pinSeat}
                  />
                ))}
              </Maps>
              <Below>
                {/* A committee held: the way to its page. Otherwise the way to
                    the committees' pages, beside the reader's own
                    legislators' switch where they have any. */}
                {held ? (
                  <DottedInternal href={maple.conference(held)}>
                    {t("go_to_conference")}
                  </DottedInternal>
                ) : (
                  <>
                    {mine.size > 0 && (
                      <LegislatorsSwitch
                        type="switch"
                        id="conference-my-legislators"
                        label={t("my_legislators")}
                        checked={selected?.kind === "mine"}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setSelected(
                            e.target.checked ? { kind: "mine" } : null
                          )
                        }
                      />
                    )}
                    {!selected && (
                      <DottedInternal href={committeesHref}>
                        {t("view_committees")}
                      </DottedInternal>
                    )}
                  </>
                )}
              </Below>
            </Explorer>
          </Wide>
        </ExplorerCard>
      </Page>
    </>
  )
}
