import { GoogleAuthProvider } from "firebase/auth"
import { useMemo } from "react"
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth"
import styled from "styled-components"
import { auth } from "../firebase"

const AuthButtons = styled(StyledFirebaseAuth)<{ borderless?: boolean }>`
  .firebaseui-container {
    ${props => props.borderless && "box-shadow: none;"}
  }

  .firebaseui-idp-list {
    padding: 0 0;
    margin: 0 0;
  }

  .firebaseui-idp-list > .firebaseui-list-item {
    margin: 0 0;
  }

  .firebaseui-idp-button {
    width: 100%;
  }
`

const FirebaseAuth: React.FC<{
  onSignIn?: (result: any) => void
  borderless?: boolean
}> = ({ onSignIn, borderless }) => {
  const uiConfig: firebaseui.auth.Config = useMemo(
    () => ({
      signInFlow: "popup",
      callbacks: {
        signInSuccessWithAuthResult: result => {
          onSignIn?.(result)
          return false
        },
        signInFailure: error => void console.warn("Sign in failure", error)
      },
      signInOptions: [GoogleAuthProvider.PROVIDER_ID]
    }),
    [onSignIn]
  )

  return (
    <AuthButtons
      borderless={borderless}
      uiConfig={uiConfig}
      firebaseAuth={auth}
    />
  )
}

export default FirebaseAuth
