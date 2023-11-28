import React from "react"
import { Button, ButtonProps, Col, Row, Stack } from "react-bootstrap"
import styled from "styled-components"

export type PrimaryButtonWithIconProps = {
  label: string
  onClick: () => void
  Icon?: JSX.Element
  iconPosition?: "left" | "right"
} & ButtonProps

export const PrimaryButtonWithIcon: React.FC<PrimaryButtonWithIconProps> = styled(
  ({
    label,
    onClick,
    className,
    Icon,
    iconPosition,
    ...rest
  }: PrimaryButtonWithIconProps) => {
    return (
      <Button
        variant="primary"
        onClick={onClick}
        className={`fs-button ${className}`}
        {...rest}
      >
        <div
          className={`${
            iconPosition === "right" ? "flex-row-reverse" : "flex-row"
          } d-flex align-items-center gap-2`}
        >
          <div className="flex-grow-0 d-flex align-content-center">
            {Icon && Icon}
          </div>
          <div className="flex-grow-0">{label}</div>
        </div>
      </Button>
    )
  }
)`
  min-width: fit-content;
  &:disabled {
    background-color: var(--bs-gray-500);
    border-color: var(--bs-gray-500);
    color: black;
    opacity: 1;
  }
`
