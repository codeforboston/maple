import { useId } from "@react-aria/utils"
import React from "react"
import type { FormControlProps } from "react-bootstrap"
import { Form, FloatingLabel } from "../bootstrap"

type InputProps = FormControlProps & {
  label: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...restProps }, ref) => {
    const id = useId()
    const errorId = `${id}-error`

    const hasError = Boolean(error)

    return (
      <Form.Group controlId={id} className={className}>
        <FloatingLabel controlId={id} label={label}>
          <Form.Control
            {...restProps}
            ref={ref}
            placeholder={label}
            isInvalid={hasError}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
          />

          <Form.Control.Feedback type="invalid" id={errorId}>
            {error}
          </Form.Control.Feedback>
        </FloatingLabel>
      </Form.Group>
    )
  }
)

Input.displayName = "Input"

export default Input
