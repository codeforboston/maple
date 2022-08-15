import { ButtonProps } from "react-bootstrap"
import styled from "styled-components"
import { Button, Image } from "../bootstrap"
import { Position } from "../db"
import { useAppDispatch } from "../hooks"
import { positionLabels } from "./content"
import { setPosition, usePublishState } from "./redux"
import { StepHeader } from "./StepHeader"

export const ChooseStance = styled(({ ...rest }) => {
  const { position: currentPosition } = usePublishState()
  const dispatch = useAppDispatch()
  const props = (position: Position) => ({
    position,
    active: currentPosition === position,
    onClick: () => dispatch(setPosition(position))
  })
  return (
    <div {...rest}>
      <StepHeader step={1}>Choose Your Stance</StepHeader>
      <div className="d-flex gap-4 justify-content-center mt-4">
        <PositionButton {...props("endorse")} />
        <PositionButton {...props("neutral")} />
        <PositionButton {...props("oppose")} />
      </div>
    </div>
  )
})``

const PositionButton = styled<
  { position: Position } & Pick<ButtonProps, "onClick" | "active">
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
    <Button {...rest} variant="outline-secondary">
      {icons[position]}
      <div className="mt-3">{positionLabels[position]}</div>
    </Button>
  )
})`
  border-radius: 0.5rem;
  display: block;
  aspect-ratio: 1;
  width: 8rem;
  height: 8rem;
`
