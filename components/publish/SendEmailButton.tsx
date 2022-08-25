import type { ButtonProps } from "react-bootstrap"
import { Button } from "../bootstrap"
import { useTestimonyEmail } from "./hooks"

export const SendEmailButton = (props: ButtonProps) => {
  const { ready, mailToUrl } = useTestimonyEmail()
  return ready ? (
    <Button
      href={mailToUrl}
      target="_blank"
      rel="noreferrer"
      variant="secondary"
      {...props}
    >
      Open Email Draft
    </Button>
  ) : null
}
