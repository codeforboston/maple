import {
  AuthProvider,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth"
import { useAsyncCallback } from "react-async-hook"
import { Image, Stack } from "../bootstrap"
import { LoadingButton } from "../buttons"
import { auth } from "../firebase"

type AuthButton = (props: {
  onClick: () => void
  loading: boolean
}) => JSX.Element

const GoogleButton: AuthButton = ({ onClick, loading }) => (
  <LoadingButton variant="light" onClick={onClick} loading={loading}>
    <Image src="google-icon.png" alt="Google" className="mx-4" />
    Continue with Google
  </LoadingButton>
)

const buttons: { provider: AuthProvider; SignInButton: AuthButton }[] = [
  { provider: new GoogleAuthProvider(), SignInButton: GoogleButton }
]

export default function SocialSignOnButtons() {
  const signInWithProvider = useAsyncCallback(
    async (provider: AuthProvider) => {
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
  )

  const isLoading = (providerId: string) => {
    const [loadingProvider] = signInWithProvider.currentParams || []
    return loadingProvider?.providerId === providerId
  }

  return (
    <Stack gap={3}>
      {buttons.map(({ provider, SignInButton }) => (
        <SignInButton
          key={provider.providerId}
          loading={isLoading(provider.providerId)}
          onClick={() => signInWithProvider.execute(provider)}
        />
      ))}
    </Stack>
  )
}
