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
    chamber === "joint" ? "var(--bs-gray-dark)" : "white"};
  font-size: 12px;
  font-weight: 700;
  line-height: 15px;
  letter-spacing: 0.03em;
  ${({ chamber }) =>
    chamber === "joint" ? "border: 1px solid var(--bs-gray-dark)" : null};
`

export const Tag: FC<React.PropsWithChildren<Props>> = ({ chamber }) => (
  <Wrapper chamber={chamber}>{chamber}</Wrapper>
)
