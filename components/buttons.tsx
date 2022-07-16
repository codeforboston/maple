import React from "react"
import type { ButtonProps } from "react-bootstrap"
import { Button, Spinner } from "./bootstrap"

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
  ...restProps
}: ButtonProps & { loading?: boolean }) => (
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
        />
        <span className="visually-hidden">Loading...</span>
      </>
    ) : null}

    {children}
  </Button>
)
