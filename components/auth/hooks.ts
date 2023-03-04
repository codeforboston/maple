import { FirebaseError } from "firebase/app"
import {
  AuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  User
} from "firebase/auth"
import { useAsyncCallback } from "react-async-hook"
import { setProfile } from "../db"
import { auth } from "../firebase"

const errorMessages: Record<string, string | undefined> = {
  "auth/email-already-exists": "You already have an account.",
  "auth/email-already-in-use": "You already have an account.",
  "auth/wrong-password": "Your password is wrong.",
  "auth/invalid-email": "The email you provided is not a valid email.",
  "auth/user-not-found": "You don't have an account."
}

function getErrorMessage(errorCode?: string) {
  const niceErrorMessage = errorCode ? errorMessages[errorCode] : undefined
  return niceErrorMessage || "Something went wrong!"
}

function useFirebaseFunction<Params, Result>(
  fn: (params: Params) => Promise<Result>
) {
  return useAsyncCallback(async (params: Params) => {
    try {
      // necessary to await here so we trap any errors thrown by the function
      const result = await fn(params)
      return result
    } catch (err) {
      console.log(err)

      const message = getErrorMessage(
        err instanceof FirebaseError ? err.code : undefined
      )
      throw new Error(message)
    }
  })
}

export type CreateUserWithEmailAndPasswordData = {
  email: string
  fullName: string
  nickname: string
  password: string
  confirmedPassword: string
}

export function useCreateUserWithEmailAndPassword() {
  return useFirebaseFunction(
    async ({
      email,
      fullName,
      nickname,
      password
    }: CreateUserWithEmailAndPasswordData) => {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      await Promise.all([
        setProfile(credentials.user.uid, {
          displayName: nickname,
          fullName,
          role: "user",
          public: false
        }),
        sendEmailVerification(credentials.user)
      ])

      return credentials
    }
  )
}

export type SignInWithEmailAndPasswordData = { email: string; password: string }

export function useSignInWithEmailAndPassword() {
  return useFirebaseFunction(
    ({ email, password }: SignInWithEmailAndPasswordData) =>
      signInWithEmailAndPassword(auth, email, password)
  )
}

export function useSendEmailVerification() {
  return useFirebaseFunction((user: User) => sendEmailVerification(user))
}

export type SendPasswordResetEmailData = { email: string }

export function useSendPasswordResetEmail() {
  return useFirebaseFunction(({ email }: SendPasswordResetEmailData) =>
    sendPasswordResetEmail(auth, email)
  )
}

export function useSignInWithPopUp() {
  return useFirebaseFunction((provider: AuthProvider) =>
    signInWithPopup(auth, provider)
  )
}
