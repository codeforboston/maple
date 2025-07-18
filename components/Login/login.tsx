import { useAppDispatch } from "../hooks"
import {
  SignInWithButton,
  signOutAndRedirectToHome,
  useAuth
} from "components/auth"
import { AuthFlowStep, authStepChanged } from "components/auth/redux"
import { useTranslation } from "next-i18next"
import { useContext, useEffect, useState } from "react"

export default function LoginPage() {
  const { t } = useTranslation("auth")
  const dispatch = useAppDispatch()
  const setCurrentModal = (step: AuthFlowStep) =>
    dispatch(authStepChanged(step))

  useEffect(() => {
    setCurrentModal("start")
  })

  return (
    <div>
      <p>Hello Login World</p>
      <br />
      <p>handle if arriving on page but already logged in</p>
    </div>
  )
}
