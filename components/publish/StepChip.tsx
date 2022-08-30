import styled from "styled-components"

export const chipHeight = 2

export const StepChip = styled<{
  active?: boolean
  step: number
  scale?: number
}>(({ step, active, ...rest }) => {
  return <div {...rest}>{step}</div>
})`
  background-color: var(
    ${({ active = false }) => (active ? "--bs-green" : "--bs-blue")}
  );
  font-size: ${({ scale = 1 }) => scale * 1.25}rem;
  width: ${({ scale = 1 }) => scale * chipHeight}rem;
  height: ${({ scale = 1 }) => scale * chipHeight}rem;
  font-style: bold;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`
