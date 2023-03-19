import { capitalize } from "lodash"

export type Position = "endorse" | "neutral" | "oppose"

export function PositionLabel({ position }: { position: Position }) {
  return (
    <div
      className={` bg-${position} px-4 py-1 text-white rounded-pill`}
      style={{ width: "max-content"}}
    >
      {capitalize(position)}
    </div>
  )
}
