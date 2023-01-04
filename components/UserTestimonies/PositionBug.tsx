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
    <Container pos={position}>
      {capitalize(position)}
      <Image src={avatar} width="100" height="100" />
    </Container>
  )
}

const Container = styled.div<{ pos: Position }>`
  border: solid 2px;
  border-color: ${p => {
    switch (p.pos) {
      case "endorse":
        return "green"
      case "neutral":
        return "black"
      case "oppose":
        return "orange"
    }
  }};
  width: fit-content;
  border-radius: 255px;
  padding: 0;
`
