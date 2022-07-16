import { AuthProvider, GoogleAuthProvider } from "firebase/auth"
import { Image, Stack } from "../bootstrap"
import { LoadingButton } from "../buttons"
import { useSignInWithPopUp } from "./hooks"

type AuthButton = (props: {
  onClick: () => void
  loading: boolean
}) => JSX.Element

const GoogleButton: AuthButton = ({ onClick, loading }) => (
  <LoadingButton
    variant="light"
    onClick={onClick}
    loading={loading}
    spinnerProps={{ className: "me-4" }}
  >
    <Image src="google-icon.png" alt="Google" className="me-4" />
    Continue with Google
  </LoadingButton>
)

const buttons: { provider: AuthProvider; SignInButton: AuthButton }[] = [
  { provider: new GoogleAuthProvider(), SignInButton: GoogleButton }
]

export default function SocialSignOnButtons() {
  const signInWithProvider = useSignInWithPopUp()

  const isLoading = (providerId: string) => {
    const [loadingProvider] = signInWithProvider.currentParams || []
    return (
      signInWithProvider.status === "loading" &&
      loadingProvider?.providerId === providerId
    )
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
