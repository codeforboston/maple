import type { ButtonProps } from "react-bootstrap"
import { Button } from "../bootstrap"
import { auth } from "../firebase"
import { signOutAndRedirectToHome } from "./service"

/** Signs out the current user. Pages that are wrapped in `requireAuth` will
 * redirect the user to the login page. */
const SignOut: React.FC<ButtonProps> = props => {
  return (
    <Button {...props} onClick={signOutAndRedirectToHome}>
      Sign out
    </Button>
  )
}

export default SignOut
