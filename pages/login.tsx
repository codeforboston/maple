import { useRouter } from "next/router"
import React, { useCallback } from "react"
import { FirebaseAuth } from "../components/auth"
import { Container } from "../components/bootstrap"
import { createPage } from "../components/page"

export default createPage({
  title: "Sign In",
  Page: () => {
    const onSignIn = useSignIn()

    return (
      <Container className="mt-3">
        <h1>Sign in to Testify</h1>
        <FirebaseAuth onSignIn={onSignIn} />
      </Container>
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
