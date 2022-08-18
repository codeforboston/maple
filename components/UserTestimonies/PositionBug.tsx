import { capitalize } from "lodash"

export type Position = "endorse" | "neutral" | "oppose"

export function PositionLabel({ position }: { position: Position }) {
  return (
    <div
      className={`h5 bg-${position} px-5 py-2 text-white rounded-pill`}
      style={{ width: "max-content" }}
    >
      {capitalize(position)}
    </div>
  )
}
