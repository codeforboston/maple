// components/bill/BillWidget.tsx
import { FC } from "react"
import styled from "styled-components"

type Chamber = "senate" | "house" | "joint"

interface Props {
  chamber: Chamber
}

const CHAMBER_TO_COLOR: Record<Chamber, string> = {
  senate: "var(--bs-red)",
  house: "var(--bs-blue)",
  joint: "white"
}

const Wrapper = styled.span<{ chamber: Chamber }>`
  text-transform: uppercase;
  background-color: ${({ chamber }) => CHAMBER_TO_COLOR[chamber]};
  padding: 2px 10px;
  border-radius: 12px;
  color: ${({ chamber }) =>
    chamber === "joint" ? "var(--charcoal)" : "white"};
  font-size: 12px;
  line-height: 15px;
  ${({ chamber }) =>
    chamber === "joint"
      ? "border: 1px solid; border-color: var(--charcoal)"
      : null};
`

export const Tag: FC<Props> = ({ chamber }) => (
  <Wrapper chamber={chamber}>{chamber}</Wrapper>
)
