import { Fragment, useCallback, useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { useProfile } from "../db"
import { shortName } from "../formatting"
import { Conferees } from "./Conferees"
import { DistrictMap, SeatPerson } from "./DistrictMap"
import { ConferenceHearings } from "./ConferenceHearings"
import { Card, CardTitle } from "./styles"
import { CHAMBERS, ConfereeView, HearingView } from "./types"

/**
 * Two name lists and two maps, laid out as one grid so the maps are equal and
 * take every pixel the names leave. Below lg the pairs stack: each chamber's
 * names beside its own map.
 */
const Grid = styled.div`
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  column-gap: 1.25rem;
  row-gap: 2rem;
  align-items: start;

  @media (min-width: 992px) {
    grid-template-columns: max-content max-content minmax(0, 1fr) minmax(0, 1fr);
    & > :nth-child(2) {
      order: 3;
    }
    & > :nth-child(3) {
      order: 2;
      padding-right: 1.75rem;
    }
    & > :nth-child(4) {
      order: 4;
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
  const { profile } = useProfile()
  // A finger has no hover, and iOS sends one on the way to a tap, so on a
  // coarse pointer only the tap counts.
  const touch = useMediaQuery("(pointer: coarse)")
  const [hovered, setHovered] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const selected = hovered ?? pinned

  const mine = useMemo(
    () =>
      new Set(
        [profile?.representative?.id, profile?.senator?.id].filter(
          (id): id is string => Boolean(id)
        )
      ),
    [profile?.representative?.id, profile?.senator?.id]
  )

  // Who each lit seat is, for the maps.
  const people = useMemo(
    () =>
      Object.fromEntries(
        conferees.flatMap((c): [string, SeatPerson][] =>
          c.seat ? [[c.seat, { name: shortName(c.name), party: c.party }]] : []
        )
      ),
    [conferees]
  )

  const hover = useCallback(
    (key: string | null) => {
      if (!touch) setHovered(key)
    },
    [touch]
  )
  const pin = useCallback(
    (key: string) => setPinned(v => (v === key ? null : key)),
    []
  )

  return (
    <Card>
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
    </Card>
  )
}
