import React, { useRef, useState } from "react"
import { ButtonProps, ImageProps, SpinnerProps, Tooltip } from "react-bootstrap"
import CopyToClipboard from "react-copy-to-clipboard"
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
}) => (
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
        <span className="visually-hidden">Loading...</span>
      </>
    ) : null}

    {children}
  </Button>
)

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

export const CopyButton = ({
  text,
  tooltipDurationMs = 1000,
  children,
  ...props
}: ButtonProps & { text: string; tooltipDurationMs?: number }) => {
  const [show, setShow] = useState(false)
  const target = useRef(null)
  const closeTimeout = useRef<any>()
  return (
    <>
      <CopyToClipboard
        text={text}
        options={{ format: "text/plain" }}
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
        {props => <Tooltip {...props}>Copied!</Tooltip>}
      </Overlay>
    </>
  )
}
