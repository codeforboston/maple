import { Button, StyledFC } from "../bootstrap"
import { auth } from "../firebase"

/** Signs out the current user. Pages that are wrapped in `requireAuth` will
 * redirect the user to the login page. */
const SignOut: StyledFC = ({ className }) => {
  return (
    <Button className={className} onClick={() => auth.signOut()}>
      Sign out
    </Button>
  )
}

export default SignOut
