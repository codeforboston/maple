import styled from "styled-components"
import { Row } from "../bootstrap"

export const Banner = styled(Row).attrs(props => ({
  className: `h3 text-center text-white justify-content-center p-3 bg-info ${props.className}`,
  children: props.children
}))``
