import { ReactNode } from "react"
import styled from "styled-components"

export const chipHeight = 2

export const StepChip = styled<{
  active?: boolean
  scale?: number
}>(({ active, ...rest }) => {
  return <div {...rest} />
})`
  background-color: var(
    ${({ active = false, scale = 1 }) =>
      active ? (scale > 1 ? "--bs-blue" : "--bs-green") : "--bs-white"}
  );
  font-size: ${({ scale = 1 }) => scale * 1.25}rem;
  width: ${({ scale = 1 }) => scale * chipHeight}rem;
  height: ${({ scale = 1 }) => scale * chipHeight}rem;
  font-style: bold;
  color: var(${({ active = false }) => (active ? "--bs-white" : "--bs-blue")});
  border-style: solid;
  border-width: 1px;
  border-color: ${({ active = false }) =>
    active ? "transparent" : "var(--bs-blue)"};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`
