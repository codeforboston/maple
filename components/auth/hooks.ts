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
import { useAppDispatch } from "../hooks"
import { authChanged } from "./redux"
import { claimsOf } from "./service"
import { completePhoneVerification, finishSignup, OrgCategory } from "./types"

const errorMessages: Record<string, string | undefined> = {
  "auth/email-already-exists": "You already have an account.",
  "auth/email-already-in-use": "You already have an account.",
  "auth/wrong-password": "Your password is wrong.",
  "auth/invalid-email": "The email you provided is not a valid email.",
  "auth/user-not-found": "You don't have an account.",
  "functions/failed-precondition":
    "Phone number is not linked to this account. Complete phone verification first.",
  "auth/credential-already-in-use":
    "This phone number is already linked to another account.",
  "auth/account-exists-with-different-credential":
    "This phone number is already linked to another account.",
  "auth/provider-already-linked":
    "This account already has a phone number linked.",
  "auth/invalid-phone-number":
    "Please enter a valid phone number (e.g. 617 555-1234).",
  "auth/operation-not-allowed":
    "Phone verification is not enabled. Please try again later or contact us at info@mapletestimony.org."
}

export function getErrorMessage(errorCode?: string) {
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
        err instanceof FirebaseError
          ? err.code
          : (err as { code?: string })?.code
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
      if (isOrg) {
        await finishSignup({
          requestedRole: "organization",
          fullName,
          orgCategories: orgCategory ? [orgCategory] : "",
          notificationFrequency: "Weekly",
          email: credentials.user.email
        })
      } else {
        await finishSignup({
          requestedRole: "user",
          fullName,
          notificationFrequency: "Weekly",
          email: credentials.user.email,
          public: true
        })
      }
      await sendVerification(credentials.user)

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

/** Sends the verification email, whose page leads back to where the reader
 * asked for it, so what they were doing when they signed up picks up there.
 * Firebase takes a continue address only on an authorized domain, which a
 * preview deploy's is not; there the email goes without one. */
async function sendVerification(user: User) {
  try {
    await sendEmailVerification(user, { url: location.href })
  } catch (err) {
    if ((err as { code?: string })?.code !== "auth/unauthorized-continue-uri")
      throw err
    await sendEmailVerification(user)
  }
}

export function useSendEmailVerification() {
  return useFirebaseFunction((user: User) => sendVerification(user))
}

/** Reads the signed-in reader's account again, for an email verified in
 * another tab, which this one would not see before a reload. Resolves to
 * whether it is now verified. */
export function useRecheckEmailVerified() {
  const dispatch = useAppDispatch()
  return useAsyncCallback(async () => {
    const user = auth.currentUser
    if (!user) return false
    await user.reload()
    if (!user.emailVerified) return false
    // The token carries the verification to the server's rules.
    const claims = claimsOf(await user.getIdTokenResult(true))
    dispatch(authChanged({ user, claims }))
    return true
  })
}

/** Call after the user has linked a phone number via linkWithPhoneNumber + confirm. */
export function useCompletePhoneVerification() {
  return useFirebaseFunction<void, { phoneVerified: true }>(
    async () => (await completePhoneVerification()).data
  )
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
          notificationFrequency: "Weekly",
          email: credentials.user.email,
          public: true
        })
      ])
    }
  })
}
