import { useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Form } from "../bootstrap"
import { Internal, maple } from "../links"
import { Chair, Conferees, ConfereeFace, yoursKey } from "./Conferees"
import { ConferenceList, ConferenceTable } from "./ConferenceTable"
import { DistrictMap, seatsOf } from "./DistrictMap"
import { useHover, useMyLegislators } from "./hooks"
import {
  CommitteeCard,
  DottedInternal,
  Eyebrow,
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
  /* The room the intro left under the title, while the intro is out. */
  margin-bottom: 1rem;
  [data-maple-theme="dd"] & {
    font-family: var(--maple-font-heading);
  }
`

/** Widened to 1320 from 992, as the conference page is
 * (ConferenceDetails.tsx). */
const Page = styled(PageColumn)`
  padding-top: 1.25rem;

  @media (min-width: 992px) {
    max-width: 1320px;
  }
`

const Intro = styled.p`
  margin: 0.375rem 0 1rem;
  padding-left: 4px;
  font-size: 1rem;
  line-height: 1.55;
  color: var(--maple-text-strong);

  @media (min-width: 576px) {
    font-size: 1.125rem;
  }
`

/** Below 960 the card is a list of links; from there up, the table and the
 * explorer side by side. Both render so the server's page is the reader's. */
const Narrow = styled.div`
  @media (min-width: 960px) {
    display: none;
  }
`

const Wide = styled.div`
  display: none;

  @media (min-width: 960px) {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    /* More room between the card's edge and the table. */
    padding-left: 1rem;
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

/** Side by side whenever the explorer shows: the card is wide enough from
 * 960 up. */
const Maps = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  padding-top: 30px;
`

const Below = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  font-size: 0.8125rem;
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
  conferences,
  conferees
}: ConferenceIndexProps) {
  const { t } = useTranslation("conferences")
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

  return (
    <Page>
      <ExplorerTitle>{t("index_title")}</ExplorerTitle>
      {/* The intro, out for now. With it back, take the title's
          margin-bottom out of ExplorerTitle. */}
      {/* <Intro>{t("index_intro")}</Intro> */}
      <CommitteeCard>
        <Narrow>
          <ConferenceList conferences={conferences} conferees={conferees} />
        </Narrow>
        <Wide>
          <ConferenceTable
            conferences={conferences}
            conferees={conferees}
            selected={held?.id ?? null}
            highlighted={highlighted}
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
                  <PanelTitle>{t("explorer")}</PanelTitle>
                )}
                {selected && (
                  <ClearButton type="button" onClick={() => setSelected(null)}>
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
              {held ? (
                <DottedInternal href={maple.conference(held)}>
                  {t("go_to_conference")}
                </DottedInternal>
              ) : mine.size > 0 ? (
                <Form.Check
                  type="switch"
                  id="conference-my-legislators"
                  label={t("my_legislators")}
                  checked={selected?.kind === "mine"}
                  onChange={e =>
                    setSelected(e.target.checked ? { kind: "mine" } : null)
                  }
                />
              ) : null}
            </Below>
          </Explorer>
        </Wide>
      </CommitteeCard>
    </Page>
  )
}
