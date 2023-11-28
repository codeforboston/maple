import { Col, ColProps } from "react-bootstrap"
import styled from "styled-components"

const BlueBox = styled(Col)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 325px;
  height: 100px;
  background: #1a3185;
  border-radius: 10px;
`

const StyledImage = styled.img`
  width: 60px;
  height: 55px;
`
const StyledText = styled.p`
  font-family: "Nunito";
  font-style: normal;
  font-weight: 700;
  font-size: 1rem;
  color: white;
  padding-top: 1rem;
`

export const ValuePlaque = ({
  title,
  src,
  alt,
  ...props
}: {
  src: string
  alt: string
  title: string
} & ColProps) => {
  return (
    <BlueBox {...props}>
      <StyledImage src={src} alt={alt} />
      <StyledText>{title}</StyledText>
    </BlueBox>
  )
}
