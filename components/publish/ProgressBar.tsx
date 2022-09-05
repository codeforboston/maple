import styled from "styled-components"
import { isComplete, Step } from "./redux"
import { chipHeight, StepChip } from "./StepChip"

const Divider = styled.div`
  height: 1px;
  background-color: var(--bs-gray-500);
  flex-grow: 1;
  margin: calc(${chipHeight / 2}rem - 0.5px) -1rem 0 -1rem;
`

export const ProgressBar = styled<{ currentStep: Step }>(
  ({ currentStep, ...rest }) => {
    return (
      <div {...rest}>
        <StepBox step={1} active={isComplete(currentStep, "position")}>
          Choose your stance
        </StepBox>
        <Divider />
        <StepBox step={2} active={isComplete(currentStep, "write")}>
          Write your testimony
        </StepBox>
        <Divider />
        <StepBox step={3}>Let your voice be heard</StepBox>
      </div>
    )
  }
)`
  display: flex;
  justify-content: space-between;
  align-content: flex-start;
  font-size: 0.75rem;
`

const StepBox: React.FC<{ step: number; active?: boolean }> = ({
  step,
  active,
  children
}) => {
  return (
    <div>
      <StepChip className="m-auto mb-2" step={step} active={active} />
      {children}
    </div>
  )
}
