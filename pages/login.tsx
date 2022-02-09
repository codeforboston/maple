import { useRouter } from "next/router"
import React, { useCallback } from "react"
import { FirebaseAuth } from "../components/auth"
import { createPage } from "../components/page"

export default createPage({
  v2: true,
  title: "Sign In",
  Page: () => {
    const onSignIn = useSignIn()

    return (
      <>
        <h1>Sign in to Testify</h1>
        <FirebaseAuth onSignIn={onSignIn} />
      </>
    )
  }
})

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
