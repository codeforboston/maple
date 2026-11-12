import { Fragment, useCallback, useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Conferees } from "./Conferees"
import { DistrictMap, seatsOf } from "./DistrictMap"
import { ConferenceHearings } from "./ConferenceHearings"
import { useHover, useMyLegislators } from "./hooks"
import { CardTitle, CommitteeCard, LAYOUT_WIDE } from "./styles"
import { CHAMBERS, ConfereeView, HearingView } from "./types"

/** The card, a little tighter on a phone than the cards' 1.25rem a side
 * (Card, styles.ts), so the names and the map beside them have more of its
 * width. */
const Frame = styled(CommitteeCard)`
  @media (max-width: 575.98px) {
    && {
      padding: 1rem 1rem 1.25rem;
    }
  }
`

/**
 * Two name lists and two maps, laid out as one grid, as the prototype does.
 * Stacked (LAYOUT_STACKED, styles.ts), two pairs in equal halves: the
 * Senate's names then its map, and the House mirrored, its map then its
 * names, so the two maps sit together. Wide (LAYOUT_WIDE), the two lists then
 * the two maps in one row, the maps equal and taking every pixel the names
 * leave.
 */
const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: 1.25rem;
  row-gap: 2rem;
  align-items: start;

  & > :nth-child(1) {
    justify-self: start;
  }
  & > :nth-child(3) {
    order: 4;
    justify-self: center;
  }
  & > :nth-child(4) {
    order: 3;
  }

  @media ${LAYOUT_WIDE} {
    grid-template-columns: max-content max-content minmax(0, 1fr) minmax(0, 1fr);
    & > :nth-child(2) {
      order: 3;
    }
    & > :nth-child(3) {
      order: 2;
      justify-self: start;
      padding-right: 1.75rem;
    }
    & > :nth-child(4) {
      order: 4;
    }
    /* Each map at its 300px most (DistrictMap.tsx), centred in its column,
       so the room the column has over that is shared out around it, as
       breathing room from the names, rather than left after it. */
    & > :nth-child(2),
    & > :nth-child(4) {
      justify-self: center;
      width: 100%;
      max-width: 300px;
    }
  }
`

export function ConferenceCommittee({
  court,
  conferees,
  hearings
}: {
  court: number
  conferees: ConfereeView[]
  hearings: HearingView[]
}) {
  const { t } = useTranslation("conferences")
  const mine = useMyLegislators()
  const [hovered, hover] = useHover<string>()
  const [pinned, setPinned] = useState<string | null>(null)
  const selected = hovered ?? pinned

  // Who each lit seat is, for the maps.
  const people = useMemo(() => seatsOf(conferees), [conferees])

  const pin = useCallback(
    (key: string) => setPinned(v => (v === key ? null : key)),
    []
  )

  return (
    <Frame>
      <CardTitle>{t("who")}</CardTitle>
      {/* The names and the maps are one area to the pointer: leaving the
          block is what lets a reading go. */}
      <Grid onPointerLeave={() => hover(null)}>
        {CHAMBERS.map(chamber => (
          <Fragment key={chamber}>
            <Conferees
              court={court}
              chamber={chamber}
              conferees={conferees}
              mine={mine}
              selected={selected}
              onHover={hover}
              onPin={pin}
            />
            <DistrictMap
              chamber={chamber}
              people={people}
              selected={selected}
              onHover={hover}
              onPin={pin}
            />
          </Fragment>
        ))}
      </Grid>
      <div className="mt-4">
        <ConferenceHearings hearings={hearings} />
      </div>
    </Frame>
  )
}
