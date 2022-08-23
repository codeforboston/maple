import { ToggleButton, ToggleButtonProps } from "react-bootstrap"
import styled from "styled-components"
import { Image } from "../bootstrap"
import { Position } from "../db"
import { useAppDispatch } from "../hooks"
import { positionLabels } from "./content"
import { usePublishState } from "./hooks"
import { FormNavigation, Next } from "./NavigationButtons"
import { setPosition } from "./redux"
import { StepHeader } from "./StepHeader"

export const ChooseStance = styled(({ ...rest }) => {
  const { position: currentPosition } = usePublishState()
  const dispatch = useAppDispatch()
  const props = (position: Position) => ({
    position,
    checked: currentPosition === position,
    onClick: () => void dispatch(setPosition(position))
  })
  const hasPosition = Boolean(currentPosition)
  return (
    <div {...rest}>
      <StepHeader step={1}>Choose Your Stance</StepHeader>
      <div className="d-flex gap-4 justify-content-center mt-4">
        <PositionButton {...props("endorse")} />
        <PositionButton {...props("neutral")} />
        <PositionButton {...props("oppose")} />
      </div>

      <FormNavigation status right={<Next disabled={!hasPosition} />} />
    </div>
  )
})``

const PositionButton = styled<
  { position: Position } & Pick<ToggleButtonProps, "onClick" | "checked">
>(({ position, ...rest }) => {
  const icons: Record<Position, React.ReactNode> = {
    neutral: (
      <Image
        alt=""
        src="thumbs-up.svg"
        style={{ transform: "scaleY(-1) rotate(-0.25turn)" }}
      />
    ),
    endorse: <Image alt="" src="thumbs-up.svg" />,
    oppose: (
      <Image alt="" src="thumbs-up.svg" style={{ transform: "scaleY(-1)" }} />
    )
  }
  return (
    <ToggleButton
      id={`${position}-btn`}
      value={position}
      type="radio"
      {...rest}
      variant="outline-secondary"
    >
      {icons[position]}
      <div className="mt-3">{positionLabels[position]}</div>
    </ToggleButton>
  )
})`
  border-radius: 0.5rem;
  display: block;
  aspect-ratio: 1;
  width: 8rem;
  height: 8rem;
`
