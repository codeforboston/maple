import { memo, ReactNode } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight, faXmark } from "@fortawesome/free-solid-svg-icons"
import type { Branch } from "../../functions/src/common"
import { Internal, maple } from "../links"
import { ConfereeFace } from "./Conferees"
import { BillLine } from "./ConferenceRail"
import { useHover } from "./hooks"
import { Eyebrow } from "./styles"
import {
  CHAMBERS,
  conferenceName,
  ConfereeView,
  ConferenceSummary,
  personKey
} from "./types"

const RULE = "1px solid #f2f2f2"

/** One chamber's conferees as the table seats them: chair, then the
 * majority, then the minority. */
const tier = (c: ConfereeView) => (c.chair ? 0 : c.party === "Democrat" ? 1 : 2)
const chamberOrder = (conferees: ConfereeView[], chamber: Branch) =>
  conferees.filter(c => c.branch === chamber).sort((a, b) => tier(a) - tier(b))

/** A cell per chamber with the gap between them, for the header and the
 * rows alike. */
const chamberCells = (cells: (chamber: Branch) => ReactNode[]) =>
  CHAMBERS.flatMap((chamber, i) => [
    ...(i > 0 ? [<td key={`gap-${chamber}`} className="gap" />] : []),
    ...cells(chamber)
  ])

const DIM = 0.35

const Table = styled.table`
  border-collapse: collapse;

  th,
  td {
    padding: 5px 4.5px;
    vertical-align: middle;
  }
  thead th,
  thead td {
    text-align: center;
  }
  tbody tr {
    border-top: ${RULE};
    cursor: pointer;
    transition: background-color 150ms ease-out;
  }
  tbody tr[aria-selected="true"] {
    background: var(--maple-surface-page);
  }
  .gap {
    width: 1.5rem;
    padding: 0;
  }
  @media (min-width: 1200px) {
    .gap {
      width: 2.375rem;
    }
  }
`

const SubLabel = styled.span`
  display: block;
  font-size: 0.6875rem;
  color: var(--maple-text-muted);
  opacity: 0.7;
`

const NameButton = styled.button<{ $tone: "strong" | "mid" | "faint" }>`
  display: block;
  width: 150px;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  font-size: 0.875rem;
  line-height: 1.3;
  color: ${({ $tone }) =>
    $tone === "faint" ? "var(--maple-text-muted)" : "var(--maple-text-strong)"};
  font-weight: ${({ $tone }) => ($tone === "mid" ? 700 : 400)};
  &[aria-pressed="true"] {
    font-weight: 600;
  }
`

const Bills = styled.span`
  display: block;
  margin-top: 1px;
  font-size: 0.6875rem;
  font-weight: 400;
  color: var(--maple-text-muted);
  .status {
    margin-left: 0.375rem;
    font-style: italic;
  }
`

/** The table's faces: 22px, 26px once the card has the room. */
const Face = styled.span<{ $dim: boolean; $gray: boolean }>`
  display: block;
  opacity: ${({ $dim }) => ($dim ? DIM : 1)};
  filter: ${({ $gray }) => ($gray ? "grayscale(1)" : "none")};
  transition: opacity 150ms ease-out, filter 200ms ease-out;

  @media (min-width: 1200px) {
    --portrait-size: 26px;
  }
`

/** Rendered on every row and shown on the held one, so the column keeps its
 * width whichever row is held. */
const Clear = styled.button<{ $shown: boolean }>`
  visibility: ${({ $shown }) => ($shown ? "visible" : "hidden")};
  width: 1.25rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--maple-text-muted);
  font-size: 0.75rem;
  &:hover {
    color: var(--maple-text-strong);
  }
`

/**
 * Every conference, one row each, with its six faces under the chamber they
 * sit for. Pointing at a row sets the others back; choosing one holds it and
 * greys the rest. While legislators are highlighted from the map or the
 * toggle, the rows they sit on stay and their faces take the ring.
 */
export function ConferenceTable({
  conferences,
  conferees,
  selected,
  highlighted,
  onSelect
}: {
  conferences: ConferenceSummary[]
  conferees: Record<string, ConfereeView[]>
  /** The conference being held, if any. */
  selected: string | null
  /** Keys of the legislators being highlighted, if any. Never set while a
   * conference is held. */
  highlighted: Set<string> | null
  onSelect: (id: string) => void
}) {
  const { t } = useTranslation("conferences")
  const [hovered, hover] = useHover<string>()
  const mode = selected
    ? "held"
    : highlighted
    ? "highlight"
    : hovered
    ? "hover"
    : "rest"

  return (
    <Table onPointerLeave={() => hover(null)}>
      <thead>
        <tr>
          <td />
          {chamberCells(chamber => [
            <th key={chamber} colSpan={3} scope="colgroup">
              <Eyebrow>{t(chamber.toLowerCase())}</Eyebrow>
            </th>
          ])}
          <td />
        </tr>
        <tr>
          <td />
          {chamberCells(chamber => [
            <td key={`${chamber}-chair`}>
              <SubLabel>{t("chair_col")}</SubLabel>
            </td>,
            <td key={`${chamber}-member`} />,
            <td key={`${chamber}-minority`}>
              <SubLabel>{t("minority_col")}</SubLabel>
            </td>
          ])}
          <td />
        </tr>
      </thead>
      <tbody>
        {conferences.map(c => {
          const people = conferees[c.id] ?? []
          const isSelected = selected === c.id
          // Whether this row stays forward in the current mode.
          const on =
            mode === "held"
              ? isSelected
              : mode === "highlight"
              ? people.some(p => highlighted!.has(personKey(p)))
              : mode === "hover"
              ? hovered === c.id
              : true
          const tone = !on
            ? mode === "hover"
              ? "strong"
              : "faint"
            : mode === "highlight" || mode === "hover"
            ? "mid"
            : "strong"
          return (
            <tr
              key={c.id}
              aria-selected={isSelected}
              onPointerEnter={() => hover(c.id)}
              onClick={() => onSelect(c.id)}
            >
              <td>
                <NameButton
                  type="button"
                  aria-pressed={isSelected}
                  $tone={tone}
                  onFocus={() => hover(c.id)}
                  onBlur={() => hover(null)}
                >
                  {conferenceName(c)}
                  <Bills>
                    <BillLine c={c} />
                  </Bills>
                </NameButton>
              </td>
              {chamberCells(chamber => {
                const faces = chamberOrder(people, chamber)
                return [0, 1, 2].map(slot => {
                  const p = faces[slot]
                  const lit = Boolean(p && highlighted?.has(personKey(p)))
                  return (
                    <td key={`${chamber}-${slot}`}>
                      {p && (
                        <Face
                          $dim={highlighted ? !lit : !on}
                          $gray={mode === "held" && !isSelected}
                        >
                          <ConfereeFace c={p} size={22} lit={lit} labelled />
                        </Face>
                      )}
                    </td>
                  )
                })
              })}
              <td>
                <Clear
                  type="button"
                  $shown={isSelected}
                  aria-label={t("clear_committee")}
                  onClick={e => {
                    e.stopPropagation()
                    onSelect(c.id)
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </Clear>
              </td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li:first-child > a {
    border-top: 0;
  }
`

const ListRow = styled(Internal)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0;
  border-top: ${RULE};
  text-decoration: none;
  color: var(--maple-text-strong);

  .name {
    display: block;
    font-weight: 600;
  }
  .text {
    flex: 1 1 auto;
    min-width: 0;
  }
  .faces {
    display: flex;
    flex: 0 0 auto;
    gap: 10px;
  }
  .chamber {
    display: flex;
  }
  .chamber > * + * {
    margin-left: -7px;
  }
  .chevron {
    color: var(--maple-text-muted);
    font-size: 0.75rem;
  }
  img {
    box-shadow: 0 0 0 2px var(--maple-surface-base);
  }
`

/** Below the table's width: the same conferences as links, faces
 * overlapped. Its props are the page's, so it renders once. */
export const ConferenceList = memo(function ConferenceList({
  conferences,
  conferees
}: {
  conferences: ConferenceSummary[]
  conferees: Record<string, ConfereeView[]>
}) {
  return (
    <List>
      {conferences.map(c => (
        <li key={c.id}>
          <ListRow href={maple.conference(c)}>
            <span className="text">
              <span className="name">{conferenceName(c)}</span>
              <Bills>
                <BillLine c={c} />
              </Bills>
            </span>
            <span className="faces">
              {CHAMBERS.map(chamber => (
                <span key={chamber} className="chamber">
                  {chamberOrder(conferees[c.id] ?? [], chamber).map(p => (
                    <ConfereeFace key={p.memberCode} c={p} size={22} />
                  ))}
                </span>
              ))}
            </span>
            <FontAwesomeIcon className="chevron" icon={faChevronRight} />
          </ListRow>
        </li>
      ))}
    </List>
  )
})
