import { Image } from "react-bootstrap"
import styled from "styled-components"

const LeafContainer = styled.div`
  height: 0;
  overflow-y: visible;
`
const LeafImage = styled(Image)`
  position: relative;
  z-index: 2;

  &.first {
    left: 100%;
    transform: translate(-62%, -50%) rotate(270deg);
  }
  &.second {
    transform: translate(-30%, -60%);
  }
  &.third {
    left: 100%;
    transform: translate(-62%, 53%) rotate(270deg);
  }
  &.fourth {
    transform: translate(30%, -67%);
  }
`

const Leaf = ({
  position
}: {
  position: "first" | "second" | "third" | "fourth"
}) => {
  return (
    <LeafContainer className="w-100">
      <LeafImage className={position} fluid src="/leaf.svg" alt="leaf" />
    </LeafContainer>
  )
}

export default Leaf
