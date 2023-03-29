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
      <ImageContainer>
        <Image className="avatar" src={avatar} width="70" height="70" />
      </ImageContainer>
      <Image className="position" src={`/thumbs-${position}.svg`} />
    </Container>
  )
}

const ImageContainer = styled.div`
  padding: 3px;
`
const Container = styled.div<{ pos: Position }>`
  display: flex;
  border: solid 3px;
  justify-content: center;
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
  border-radius: 500px;

  width: fit-content;
  height: fit-content;
  position: relative;

  padding: 0;
  margin: 10px;
  margin-right: 3%;

  .position {
    position: absolute;
    bottom: 0px;
    top: 60px;
    align-self: flex-end;
  }
`
