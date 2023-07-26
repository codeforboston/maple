import styled from "styled-components"
import { StepChip } from "./StepChip"

export const StepHeader = styled<{ step?: number }>(
  ({ step, children, ...rest }) => {
    return (
      <div {...rest}>
        {!!step && (
          <StepChip scale={2} className="me-4">
            {step}
          </StepChip>
        )}
        {children}
      </div>
    )
  }
)`
  display: flex;
  align-items: center;
  font-size: 2rem;
`
