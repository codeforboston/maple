import styled from "styled-components"
import { Row } from "../bootstrap"

export const Banner = styled(Row).attrs(props => ({
  className: props.className,
  children: props.children
}))`
  font-family: Nunito;
  font-size: 25px;
  text-align: center;
  justify-content: center;
  padding: 0.75rem;
  color: white;
  background-color: #ff8600;
`
