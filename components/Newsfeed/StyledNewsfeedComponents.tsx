import styled from "styled-components"
import { Container, Col, Row } from "../bootstrap"

export const BillCol = styled(Col)`
  position: relative;
  right: 35px;

  @media (max-width: 450px) {
    flex-direction: column;
    right: 0px;
  }
`

export const Header = styled(Row)`
  align-items: center;
  margin: 2.5rem 0;
  padding-right: 0;
  padding-left: 0;
`

export const HeaderTitle = styled(Col)`
  font-style: normal;
  font-weight: 700;
  font-size: 40px;
  line-height: 48px;
  letter-spacing: -0.03em;
  color: #000000;
`

export const StyledContainer = styled(Container)`
  max-width: 700px;
  .checkbox {
    width: 187px;
    padding: 0px;
    color: #12266f;
  }
  .checkbox input {
    height: 16px;
    width: 16px;
    background-color: transparent;
    border-color: #12266f;
  }
  .checkbox input:checked {
    background-color: #12266f;
  }
`
