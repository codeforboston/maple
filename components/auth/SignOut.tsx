import type { ButtonProps } from "react-bootstrap"
import { Button } from "../bootstrap"
import { auth } from "../firebase"

/** Signs out the current user. Pages that are wrapped in `requireAuth` will
 * redirect the user to the login page. */
const SignOut: React.FC<ButtonProps> = props => {
  return (
    <Button className="btn-primary" {...props} onClick={() => auth.signOut()}>
      Sign out
    </Button>
  )
}

export default SignOut
