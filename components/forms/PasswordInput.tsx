import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useId } from "@react-aria/utils"
import clsx from "clsx"
import { forwardRef, useState } from "react"
import type { FormControlProps } from "react-bootstrap"
import { Form, FloatingLabel } from "../bootstrap"
import styles from "./PasswordInput.module.css"

type PasswordInputProps = Omit<
  FormControlProps,
  // we manage these props, so we want ts to yell at you if you pass them in
  "type" | "placeholder" | "isInvalid" | "aria-invalid" | "aria-describedby"
> & {
  label: string
  error?: string
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className, ...restProps }, ref) => {
    const id = useId()
    const errorId = `${id}-error`
    const toggleId = `${id}-toggle`

    const hasError = Boolean(error)

    const [isShowing, setIsShowing] = useState(false)
    const toggleIsShowing = () => setIsShowing(!isShowing)

    return (
      <Form.Group controlId={id} className={className}>
        <FloatingLabel
          controlId={id}
          label={label}
          className={styles.passwordContainer}
        >
          <Form.Control
            {...restProps}
            type={isShowing ? "text" : "password"}
            ref={ref}
            placeholder={label}
            className={styles.passwordInput}
            isInvalid={hasError}
            aria-invalid={hasError}
            aria-describedby={clsx(hasError && errorId, toggleId)}
          />

          {/* TODO: fix focus ring color */}
          <button
            type="button"
            onClick={toggleIsShowing}
            aria-label={isShowing ? `Hide ${label}` : `Show ${label}`}
            className={clsx(
              styles.toggleButton,
              isShowing && styles.toggleButtonShowing
            )}
          >
            <FontAwesomeIcon icon={isShowing ? faEyeSlash : faEye} />
          </button>

          <Form.Control.Feedback type="invalid" id={errorId}>
            {error}
          </Form.Control.Feedback>
        </FloatingLabel>
      </Form.Group>
    )
  }
)

PasswordInput.displayName = "PasswordInput"

export default PasswordInput
