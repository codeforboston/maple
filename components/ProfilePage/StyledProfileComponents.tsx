import styled from "styled-components"
import { Container, Image, Col, Row } from "../bootstrap"

export const StyledImage = styled(Image)`
  width: 14.77px;
  height: 12.66px;
  margin-left: 8px;
`

export const Header = styled("div").attrs(props => ({
  className: `h1 d-flex flex-column flex-md-row align-items-center my-5 px-0 h-auto gx-0 ${props.className}`
}))``

export const ContactInfoRow = styled(Row)`
  font-size: 1.375rem;
  font-weight: 500;
`

export const ProfileDisplayName = styled.div.attrs<{ large: boolean }>(
  props => ({
    className: `m-0 ${
      props.large ? "h1" : "h2"
    } text-left text-black tracking-narrow ${props.className}`
  })
)`
  max-height: 108px;
`

export const ProfileDisplayNameSmall = styled(Col).attrs(props => ({
  className: `m-0 h2 text-left text-black tracking-narrow${props.className}`
}))``
