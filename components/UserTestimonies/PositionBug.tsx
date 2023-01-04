import { capitalize } from "lodash"
import { Image } from "react-bootstrap"
import styled from "styled-components"

export type Position = "endorse" | "neutral" | "oppose"

export function PositionLabel({
  position,
  avatar
}: {
  position: Position
  avatar: string
}) {
  return (
    <div
      className={` bg-${position} px-4 py-1 text-white rounded-pill`}
      style={{ width: "max-content" }}
    >
      {capitalize(position)}
      <Image src={avatar} width="100" height="100" />
    </div>
  )
}
