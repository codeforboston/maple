import type { ButtonProps } from "react-bootstrap"
import { Button } from "../bootstrap"
import { auth } from "../firebase"

// Signout, and redirect to the home page.
const handleSignout = () => {
  auth.signOut()
  location.assign(`/`) // Redirect to the home page.
}

/** Signs out the current user. Pages that are wrapped in `requireAuth` will
 * redirect the user to the login page. */
const SignOut: React.FC<ButtonProps> = props => {
  return (
    <Button {...props} onClick={handleSignout}>
      Sign out
    </Button>
  )
}

export default SignOut
