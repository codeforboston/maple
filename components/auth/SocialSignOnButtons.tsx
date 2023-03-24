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
    <Image src="/google-icon.png" alt="Google" className="me-4" />
    Continue with Google
  </LoadingButton>
)

type ButtonWithProvider = {
  provider: AuthProvider
  SignOnButton: AuthButton
}

const buttons: ButtonWithProvider[] = [
  { provider: new GoogleAuthProvider(), SignOnButton: GoogleButton }
]

export default function SocialSignOnButtons(props: { onComplete: () => void }) {
  const signInWithPopUp = useSignInWithPopUp()

  const isLoading = (providerId: string) => {
    const [loadingProvider] = signInWithPopUp.currentParams || []
    return (
      signInWithPopUp.status === "loading" &&
      loadingProvider?.providerId === providerId
    )
  }

  return (
    <Stack gap={3}>
      {buttons.map(({ provider, SignOnButton }) => (
        <SignOnButton
          key={provider.providerId}
          loading={isLoading(provider.providerId)}
          onClick={() =>
            signInWithPopUp.execute(provider).then(props.onComplete)
          }
        />
      ))}
    </Stack>
  )
}
