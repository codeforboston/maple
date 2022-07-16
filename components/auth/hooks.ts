import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from "firebase/auth"
import { useAsyncCallback } from "react-async-hook"
import { auth } from "../firebase"

// TODO: map firebase errors to nice error messages

export type SignInWithEmailAndPasswordData = { email: string; password: string }

export function useSignInWithEmailAndPassword() {
  return useAsyncCallback(
    async ({ email, password }: SignInWithEmailAndPasswordData) => {
      const credentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      console.log(credentials)
    }
  )
}

export type SendPasswordResetEmailData = { email: string }

export function useSendPasswordResetEmail() {
  return useAsyncCallback(async ({ email }: SendPasswordResetEmailData) => {
    await sendPasswordResetEmail(auth, email)
  })
}
