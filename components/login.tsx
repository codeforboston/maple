import { GoogleAuthProvider, EmailAuthProvider, User } from "firebase/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import styled from "styled-components";
import * as bootstrap from "./bootstrap";
import { auth } from "./firebase";

const { Modal } = bootstrap;
const Button = styled(bootstrap.Button)`
  min-width: 6rem;
`;

export function Account(props: any) {
  const authenticated = useAuthState() !== null;
  return authenticated ? <Logout {...props} /> : <Login {...props} />;
}

function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => auth.onAuthStateChanged((user) => setUser(user)), []);
  return user;
}

function Logout(props: any) {
  return (
    <Button
      onClick={() =>
        auth
          .signOut()
          .then(() => console.log("Sign out success"))
          .catch((e) => console.warn("Sign out failure", e))
      }
      {...props}
    >
      Sign out
    </Button>
  );
}

function Login(props: any) {
  const [show, setShow] = useState(false),
    close = useCallback(() => setShow(false), []);
  const uiConfig: firebaseui.auth.Config = useMemo(
    () => ({
      signInFlow: "popup",
      callbacks: {
        signInSuccessWithAuthResult: (result) => (
          console.log("Sign in success", result), false
        ),
        signInFailure: (error) => void console.warn("Sign in failure", error),
      },
      signInOptions: [
        EmailAuthProvider.PROVIDER_ID,
        GoogleAuthProvider.PROVIDER_ID,
      ],
    }),
    []
  );

  return (
    <>
      <Button onClick={() => setShow(true)} {...props}>
        Sign In
      </Button>
      <Modal show={show} onHide={close} aria-labelledby="login-modal" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title id="login-modal">
            Sign In to Provide Testimony
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StyledFirebaseAuth
            uiConfig={uiConfig}
            firebaseAuth={auth}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}
