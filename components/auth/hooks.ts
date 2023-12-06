import { FirebaseError } from "firebase/app"
import {
  AuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
  UserCredential
} from "firebase/auth"
import { useAsyncCallback } from "react-async-hook"
import { setProfile } from "../db"
import { auth } from "../firebase"
import { finishSignup, OrgCategory } from "./types"

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
  password: string
  confirmedPassword: string
  orgCategory?: OrgCategory
}

export function useCreateUserWithEmailAndPassword(isOrg: boolean) {
  return useFirebaseFunction(
    async ({
      email,
      fullName,
      password,
      orgCategory
    }: CreateUserWithEmailAndPasswordData) => {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      await finishSignup({ requestedRole: isOrg ? "organization" : "user" })

      const categories = orgCategory ? [orgCategory] : ""

      if (isOrg) {
        await Promise.all([
          setProfile(credentials.user.uid, {
            fullName,
            orgCategories: categories,
            notificationFrequency: "Monthly",
            email: credentials.user.email
          }),
          sendEmailVerification(credentials.user)
        ])
      } else {
        await Promise.all([
          setProfile(credentials.user.uid, {
            fullName,
            notificationFrequency: "Monthly",
            email: credentials.user.email,
            public: true
          }),
          sendEmailVerification(credentials.user)
        ])
      }

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
  return useFirebaseFunction(async (provider: AuthProvider) => {
    let credentials: UserCredential
    try {
      credentials = await signInWithPopup(auth, provider)
    } catch (e) {
      console.log("error signing in with google", e)
      return
    }

    const { claims } = await credentials.user.getIdTokenResult()
    if (!claims?.role) {
      // The user has not yet finished signing up
      await finishSignup({ requestedRole: "user" })
      await Promise.all([
        setProfile(credentials.user.uid, {
          fullName: credentials.user.displayName ?? "New User",
          notificationFrequency: "Monthly",
          email: credentials.user.email,
          public: true
        })
      ])
    }
  })
}
