import { Alert, Button, Col, Form, Modal, Stack } from "../bootstrap"
import { useAppDispatch } from "../hooks"
import {
  SignInWithButton,
  signOutAndRedirectToHome,
  useAuth
} from "components/auth"
import { AuthFlowStep, authStepChanged } from "components/auth/redux"
import { useTranslation } from "next-i18next"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { useRouter } from "next/router"

export default function LoginPage() {
  const { t } = useTranslation("auth")
  // const dispatch = useAppDispatch()
  // const setCurrentModal = (step: AuthFlowStep) =>
  //   dispatch(authStepChanged(step))

  // useEffect(() => {
  //   setCurrentModal("start")
  // })

  // const navigate = useNavigate()
  // const handleGoBack = () => {
  //   navigate(-1) // Navigates back one entry in the history stack
  // }

  const router = useRouter()

  // const location = useLocation()

  return (
    <div>
      <p>Hello Login World</p>
      <br />
      <p>
        You were possibly signed out while trying to go to a page that needs you
        to be signed in
      </p>
      <br />
      <div>Please consider logging in first:</div>
      <div className="" style={{ width: "100px" }}>
        <SignInWithButton />
      </div>
      <br />
      <p>If logged in, try and provide user with link to prior navpoint</p>
      <p>Current Pathname: {router.pathname}</p>
    </div>
  )
}
