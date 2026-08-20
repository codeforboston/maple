import styled from "styled-components"
import { Row } from "../bootstrap"

export const Banner = styled(Row).attrs(props => ({
  className: `h3 text-center text-white justify-content-center p-3 bg-warning m-0 gx-0 w-100 ${props.className}`,
  children: props.children
}))``
