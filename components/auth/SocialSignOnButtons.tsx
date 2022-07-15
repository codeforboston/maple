import {
  AuthProvider,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth"
import { Button, Image, Stack } from "../bootstrap"
import { auth } from "../firebase"

type AuthButton = (props: { onClick: () => void }) => JSX.Element

const GoogleButton: AuthButton = ({ onClick }) => (
  <Button variant="light" onClick={onClick}>
    <Image src="google-icon.png" alt="Google" className="mx-4" />
    Continue with Google
  </Button>
)

const buttons: { provider: AuthProvider; SignInButton: AuthButton }[] = [
  { provider: new GoogleAuthProvider(), SignInButton: GoogleButton }
]

export default function SocialSignOnButtons() {
  const signInWithProvider = async (provider: AuthProvider) => {
    try {
      const userCredentials = await signInWithPopup(auth, provider)
      console.log(userCredentials)
    } catch (err) {
      console.log(
        `error while signing in with provider id ${provider.providerId}:`,
        err
      )
    }
  }

  return (
    <Stack gap={3}>
      {buttons.map(({ provider, SignInButton }) => (
        <SignInButton
          key={provider.providerId}
          onClick={() => signInWithProvider(provider)}
        />
      ))}
    </Stack>
  )
}
