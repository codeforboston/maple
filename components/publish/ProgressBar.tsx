import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styled from "styled-components"
import { isComplete, isCurrent, Step } from "./redux"
import { chipHeight, StepChip } from "./StepChip"
import { useTranslation } from "next-i18next"

const Divider = styled.div`
  height: 1px;
  background-color: var(--bs-gray-500);
  flex-grow: 1;
  margin: calc(${chipHeight / 2}rem - 0.5px) -1rem 0 -1rem;
`

export const ProgressBar = styled<{ currentStep: Step }>(
  ({ currentStep, ...rest }) => {
    const { t } = useTranslation("testimony")
    const renderStep = (idx: number, step: Step, label: string) => (
      <StepBox
        key={step}
        step={idx}
        current={isCurrent(currentStep, step)}
        complete={isComplete(currentStep, step)}
      >
        {label}
      </StepBox>
    )
    return (
      <div {...rest}>
        {renderStep(1, "position", t("submitTestimonyForm.chooseStance"))}
        <Divider />
        {renderStep(2, "write", t("submitTestimonyForm.write.header"))}
        <Divider />
        {renderStep(3, "publish", t("publish.confirmAndSend"))}
      </div>
    )
  }
)`
  display: flex;
  justify-content: space-between;
  align-content: flex-start;
  font-size: 0.75rem;
`

const StepBox: React.FC<
  React.PropsWithChildren<{
    step: number
    current?: boolean
    complete?: boolean
  }>
> = ({ step, current, complete, children }) => {
  return (
    <div>
      <StepChip className="m-auto mb-2" active={current || complete}>
        {complete ? <FontAwesomeIcon icon={faCheck} /> : step}
      </StepChip>
      {children}
    </div>
  )
}
