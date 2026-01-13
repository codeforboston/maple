import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { ReactNode, useRef, useState } from "react"
import { ButtonProps, ImageProps, SpinnerProps, Tooltip } from "react-bootstrap"
import CopyToClipboard from "react-copy-to-clipboard"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Button, Image, Overlay, OverlayTrigger, Spinner } from "./bootstrap"
import { Internal } from "./links"

export const TableButton = ({
  onclick,
  children
}: {
  onclick?: () => void
  children: React.ReactElement
}) => {
  return (
    <Button variant="primary" className="m-1" onClick={onclick}>
      {children}
    </Button>
  )
}

export const LoadingButton = ({
  loading,
  children,
  disabled,
  spinnerProps,
  ...restProps
}: ButtonProps & {
  loading?: boolean
  spinnerProps?: Partial<Omit<SpinnerProps, "as" | "role" | "aria-hidden">>
}) => {
  const { t } = useTranslation("common")
  return (
    <Button {...restProps} disabled={loading || disabled}>
      {loading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden
            className="me-2"
            {...spinnerProps}
          />
          <span className="visually-hidden">{t("loading.inProgress")}</span>
        </>
      ) : null}

      {children}
    </Button>
  )
}

export const ImageButton = styled<
  Pick<ImageProps, "alt" | "src"> & { tooltip?: string; href?: string }
>(({ alt, tooltip, href, ...rest }) => {
  const link = !!href
  const img = <Image alt={alt} tabIndex={0} role="button" {...rest} />
  const content = link ? <Internal href={href}>{img}</Internal> : img
  return tooltip ? (
    <OverlayTrigger
      delay={500}
      placement="top"
      overlay={<Tooltip>{tooltip}</Tooltip>}
    >
      {content}
    </OverlayTrigger>
  ) : (
    content
  )
})`
  cursor: pointer;

  transition: filter 0.15s ease-in-out, outline-width 0.1s ease-in-out;
  &:hover {
    filter: brightness(70%);
  }
  &:active {
    filter: brightness(50%);
  }
  &:focus {
    outline: 3px solid var(--bs-blue-300);
  }
  border-radius: 3px;

  padding: 1px;
`

export const TextButton = ({
  label,
  className
}: { label: string; className?: string } & ButtonProps) => {
  return (
    <Button variant="link" className={`${className}`}>
      {label}
    </Button>
  )
}

type FillButtonProps = ButtonProps & {
  label?: string
  Icon?: ReactNode
}

export const FillButton = ({
  variant = "primary",
  Icon,
  className,
  label,
  ...rest
}: FillButtonProps) => {
  return (
    <Button
      variant={variant}
      type="button"
      className={`py-1 col-12 d-flex justify-content-center align-items-center text-decoration-none text-nowrap ${className}`}
      {...rest}
    >
      <div className={`d-flex align-items-center`}>{Icon && Icon}</div>
      {label}
    </Button>
  )
}

type OutlineButtonProps = ButtonProps & {
  label?: string
  Icon?: ReactNode
  ref?: React.ForwardedRef<HTMLButtonElement>
}

export const OutlineButton = ({
  variant = "outline-secondary",
  Icon,
  className,
  label,
  ...rest
}: OutlineButtonProps) => {
  const hoverClass = `btn-hover-${variant.split("-")[1]}`
  const activeClass = `btn-active-outline-${variant}`

  return (
    <Button
      variant={variant}
      className={`py-1 col-12 text-capitalize text-nowrap d-flex justify-content-center align-items-center ${hoverClass} ${activeClass} ${className}`}
      {...rest}
    >
      <div className={`d-flex align-items-center`}>{Icon && Icon}</div>
      {label}
    </Button>
  )
}

type HighContrastButton = ButtonProps & {
  state?: boolean
  label?: string
  Icon?: ReactNode
  reverse?: boolean
  ref?: React.ForwardedRef<HTMLButtonElement>
}

export const HighContrastButton = ({
  state,
  variant = "secondary",
  className,
  Icon,
  label,
  reverse,
  ...rest
}: HighContrastButton) => {
  let hoverClass: string, activeClass: string
  if (variant?.startsWith("outline")) {
    hoverClass = `btn-hover-${variant.split("-")[1]}`
    activeClass = `btn-active-outline-${variant}`
  } else {
    hoverClass = `btn-hover-outline-${variant}`
    activeClass = `btn-active-${variant.split("-")[1]}`
  }
  return (
    <Button
      variant={variant}
      className={` d-flex ${
        reverse
          ? "flex-row-reverse justify-content-start"
          : "justify-content-center"
      } col-12 ${hoverClass} ${activeClass} ${className} `}
      {...rest}
    >
      {Icon && Icon}
      {label}
    </Button>
  )
}

type ToggleButtonProps = OutlineButtonProps & {
  stateTrueLabel: string
  stateFalseLabel: string
  toggleState: boolean
  onClick: () => void
}

export const ToggleButton = ({
  stateTrueLabel,
  stateFalseLabel,
  toggleState,
  variant = "secondary",
  ...rest
}: ToggleButtonProps) => {
  let toggleClass
  if (variant?.startsWith("outline")) {
    toggleClass = toggleState ? variant : `${variant.split("-")[1]}`
  } else {
    toggleClass = toggleState ? variant : `outline-${variant}`
  }

  return (
    <HighContrastButton
      variant={toggleClass}
      label={toggleState ? stateTrueLabel : stateFalseLabel}
      {...rest}
    />
  )
}

export type CustomDropdownButtonProps = ButtonProps & {
  label: string
  variant?: string
  variantColor?: string
  show?: boolean | undefined
}

export const CustomDropdownButton = React.forwardRef<
  HTMLDivElement,
  CustomDropdownButtonProps
>(({ label, className, variant, variantColor, show, ...rest }, ref) => {
  const Icon = show ? (
    <FontAwesomeIcon icon={faChevronUp} className={variant} />
  ) : (
    <FontAwesomeIcon icon={faChevronDown} className={variant} />
  )

  return (
    <div ref={ref} className={`col-12`}>
      {" "}
      {/* The ref needs to be on a dom element, 
    but it does not need to be passed all the way down to the actual button, 
    just something that catches the click event
    */}
      <HighContrastButton
        className={`d-flex align-items-center justify-content-left gap-2 p-2 col-12 ${className} `}
        variant={variant ?? "secondary"}
        label={label}
        Icon={
          <div className={`ms-auto border-start border-2 ps-2 `}>{Icon}</div>
        }
        reverse
        {...rest}
      />
    </div>
  )
})

CustomDropdownButton.displayName = "CustomDropdownButton"

export const TooltipButton = styled<{
  tooltip: string
  text: string
  variant?: string
}>(({ tooltip, text, variant, ...rest }) => {
  return (
    <OverlayTrigger
      delay={500}
      placement="right"
      overlay={<Tooltip>{tooltip}</Tooltip>}
    >
      <Button variant={variant} {...rest}>
        {text}
      </Button>
    </OverlayTrigger>
  )
})`
  font-size: 14px;

  transition: filter 0.15s ease-in-out, outline-width 0.1s ease-in-out;
  &:hover {
    filter: brightness(70%);
  }
  &:active {
    filter: brightness(50%);
  }
  &:focus {
    outline: 3px solid var(--bs-blue-300);
  }
  border-radius: 3px;

  padding: 1px;
`

export const CopyButton = ({
  text,
  tooltipDurationMs = 1000,
  children,
  format = "text/html",
  ...props
}: ButtonProps & {
  text: string
  tooltipDurationMs?: number
  format?: string
}) => {
  const { t } = useTranslation("common")
  const [show, setShow] = useState(false)
  const target = useRef(null)
  const closeTimeout = useRef<any>()
  return (
    <>
      <CopyToClipboard
        text={text}
        options={{ format: format }}
        onCopy={(_, success) => {
          if (success) {
            clearTimeout(closeTimeout.current)
            setShow(true)
            closeTimeout.current = setTimeout(
              () => setShow(false),
              tooltipDurationMs
            )
          }
        }}
      >
        <Button ref={target} variant="secondary" {...props}>
          {children}
        </Button>
      </CopyToClipboard>
      <Overlay target={target} show={show} placement="top">
        {props => <Tooltip {...props}>{t("copiedToClipboard")}</Tooltip>}
      </Overlay>
    </>
  )
}

export const GearIcon = (
  <div className={`py-0`}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      className={`bi bi-gear-fill px-1 pb-1`}
      viewBox="0 0 16 16"
    >
      <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
    </svg>
  </div>
)

export const GearButton = styled(
  ({ children, className, ...props }: ButtonProps) => {
    return (
      <Button
        className={`py-1 fs-5 text-capitalize d-flex align-items-end justify-content-center ${className}`}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          className={`bi bi-gear-fill px-1 pb-1`}
          viewBox="0 0 16 16"
        >
          <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
        </svg>
        {children}
      </Button>
    )
  }
)`
  --bs-btn-bg: white; // override bootstrap button background transparency to match Figma
`
