import type { ButtonProps } from "react-bootstrap"
import { Button } from "../bootstrap"
import { auth } from "../firebase"
import { useLogoutWithDelay } from "./service"
import { useTranslation } from "next-i18next"

/** Signs out the current user. Pages that are wrapped in `requireAuth` will
 * redirect the user to the login page. */
const SignOut: React.FC<React.PropsWithChildren<ButtonProps>> = props => {
  const { t } = useTranslation("auth")
  const logoutWithDelay = useLogoutWithDelay()

  return (
    <Button {...props} onClick={logoutWithDelay}>
      {t("signOut")}
    </Button>
  )
}

export default SignOut
