import { PolicyContent } from "./PolicyContent"
import { Button, Stack, Container } from "react-bootstrap"
import { ButtonHTMLAttributes, useEffect, useState } from "react"
import style from "./PolicyPage.module.css"
import Router from "next/router"

const policies = [
  "terms-of-service",
  "privacy-policy",
  "code-of-conduct"
] as const
export type Policy = (typeof policies)[number]

export default function PolicyPage({
  policy = "privacy-policy"
}: {
  policy?: Policy
}) {
  const handleOnClick = (p: Policy) => {
    Router.push(`/policies/${p}`)
  }

  return (
    <Container className={style.policyContent}>
      <h1>Policies</h1>

      <Stack direction="horizontal">
        <Button
          className={`${
            style[policy === "privacy-policy" ? "currentTab" : "tab"]
          }`}
          id="privacy-policy"
          onClick={e => handleOnClick("privacy-policy")}
        >
          Privacy <br /> Policy
        </Button>
        <Button
          className={`${
            style[policy === "terms-of-service" ? "currentTab" : "tab"]
          }`}
          id="terms-of-service"
          onClick={e => handleOnClick("terms-of-service")}
        >
          Terms <br /> of Service
        </Button>
        <Button
          className={`${
            style[policy === "code-of-conduct" ? "currentTab" : "tab"]
          }`}
          id="code-of-conduct"
          onClick={e => handleOnClick("code-of-conduct")}
        >
          Code of <br /> Conduct
        </Button>
      </Stack>

      <PolicyContent policy={policy} />
    </Container>
  )
}
