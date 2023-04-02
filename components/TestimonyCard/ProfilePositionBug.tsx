import { capitalize } from "lodash"
import { Image } from "react-bootstrap"
import styled from "styled-components"

export type Position = "endorse" | "neutral" | "oppose"

export function ProfilePositionLabel({
  position,
  avatar
}: {
  position: Position
  avatar: string
}) {
  return (
    <Container pos={position}>
      <ImageContainer>
        <StyledImage alt="profile image" src={avatar} />
      </ImageContainer>
      <Image
        alt="thumbs icon"
        className="position"
        src={`/thumbs-${position}.svg`}
      />
    </Container>
  )
}

const StyledImage = styled(Image)`
  width: 60;
  height: 60;
  border-radius: 50%;
`

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
  border-radius: 50%;
  width: fit-content;
  height: fit-content;
  position: relative;

  padding: 0;

  .position {
    position: absolute;
    top: ${p => {
      switch (p.pos) {
        case "endorse":
          return "40px"
        default:
          return "45px"
      }
    }};
    align-self: flex-end;
  }
`
