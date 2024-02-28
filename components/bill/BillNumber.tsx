import styled from "styled-components"
import { externalBillLink } from "../links"
import { FC } from "../types"
import { BillProps } from "./types"

export const Styled = styled.div`
  font-size: 4rem;
  a {
    /*
    design team asked to put decoration back; remove comment if people change their minds
    https://github.com/codeforboston/maple/issues/998
    */

    // text-decoration: none;
    display: inline-flex;
    align-items: baseline;
  }
  svg {
    max-height: 2rem;
    max-height: 2rem;
  }
`

export const BillNumber: FC<React.PropsWithChildren<BillProps>> = ({
  bill
}) => {
  return <Styled>{externalBillLink(bill)}</Styled>
}
