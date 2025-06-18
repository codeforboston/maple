import { useId } from "@react-aria/utils"
import clsx from "clsx"
import { forwardRef, ReactNode, useState } from "react"
import type { FormControlProps } from "react-bootstrap"
import { Form } from "../bootstrap"
import { Image } from "../bootstrap"
import styled from "styled-components"
import { Maybe } from "common"

export type InputProps = Omit<
  FormControlProps,
  // we manage these props, so we want ts to yell at you if you pass them in
  "placeholder" | "isInvalid" | "aria-invalid" | "aria-describedby"
> & {
  label: string
  error?: string
  floating?: boolean
  help?: ReactNode
  placeholder?: string
  iconSrc?: string

  /** Used when `as="textarea"` */
  rows?: number
}

const StyledIcon = styled(Image)`
  margin-right: 0.5rem;
  margin-bottom: 0.1rem;
`

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      placeholder,
      error,
      floating = true,
      help,
      className,
      iconSrc,
      children,
      ...restProps
    },
    ref
  ) => {
    const id = useId()
    const errorId = `${id}-error`
    const hasError = Boolean(error)

    const control = (
      <>
        <Form.Control
          {...restProps}
          ref={ref}
          placeholder={placeholder ?? label}
          isInvalid={hasError}
          aria-invalid={hasError}
          aria-describedby={clsx(hasError && errorId)}
        />
        <Form.Control.Feedback type="invalid" id={errorId}>
          {error}
        </Form.Control.Feedback>
        {help && <Form.Text>{help}</Form.Text>}
      </>
    )

    return (
      <Form.Group controlId={id} className={className}>
        {floating ? (
          <Form.Floating>
            {control}
            <label className="d-flex justify-content-center" htmlFor={id}>
              {iconSrc && <StyledIcon alt="icon" src={iconSrc} />}
              {label}
            </label>
          </Form.Floating>
        ) : (
          <>
            <Form.Label>{label}</Form.Label>
            {children}
            {control}
          </>
        )}
      </Form.Group>
    )
  }
)

Input.displayName = "Input"

export default Input

export const TextArea = ({
  content,
  setContent,
  error,
  ...inputProps
}: {
  content?: Maybe<string>
  setContent: (c: string) => void
  error?: string
} & InputProps) => {
  const didLoadSavedContent = !!content
  const [touched, setTouched] = useState(didLoadSavedContent)
  return (
    <Input
      as="textarea"
      floating={false}
      rows={12}
      value={content ?? undefined}
      onChange={e => {
        setTouched(true)
        setContent(e.target.value)
      }}
      onBlur={() => setTouched(true)}
      error={touched ? error : undefined}
      {...inputProps}
    />
  )
}
