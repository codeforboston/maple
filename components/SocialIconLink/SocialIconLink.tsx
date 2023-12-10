import { FC } from "react"
import styled from "styled-components"

export const Container = styled.div`
  height: 35px;
  width: 35px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`

interface Props {
  href: string
  svgSrc: string
  alt: string
}

export const SocialIconLink: FC<React.PropsWithChildren<Props>> = ({ href, svgSrc, alt }) => (
  <Container>
    <a href={href} target="_blank" rel="noreferrer">
      <img src={svgSrc} alt={alt} />
    </a>
  </Container>
)
