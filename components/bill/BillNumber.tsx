import styled from "styled-components"
import { externalBillLink } from "../links"
import { FC } from "../types"
import { BillProps } from "./types"

export const Styled = styled.div`
  font-size: 4rem;
  a {
    text-decoration: none;
    display: inline-flex;
    align-items: baseline;
  }
  svg {
    max-height: 2rem;
    max-height: 2rem;
  }
`

export const BillNumber: FC<BillProps> = ({ bill }) => {
  return <Styled>{externalBillLink(bill)}</Styled>
}
