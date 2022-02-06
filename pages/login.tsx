import { useRouter } from "next/router"
import React, { useCallback, useEffect } from "react"
import { FirebaseAuth, useAuth } from "../components/auth"
import NewLayout from "../components/NewLayout/NewLayout"

export default function Page() {
  const onSignIn = useSignIn()

  return (
    <NewLayout pageTitle="Sign In">
      <h1>Sign in to Post Testimony</h1>
      <FirebaseAuth onSignIn={onSignIn} />
    </NewLayout>
  )
}

function useSignIn() {
  const router = useRouter(),
    r = router.query.r,
    redirect = typeof r === "string" ? decodeURIComponent(r) : null,
    onSignIn = useCallback(
      result => {
        if (redirect) {
          router.push(redirect)
        } else if (result.additionalUserInfo?.isNewUser) {
          router.push("/profile")
        } else {
          router.push("/")
        }
      },
      [redirect, router]
    )
  return onSignIn
}
