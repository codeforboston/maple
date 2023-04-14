import { PolicyContent } from "./PolicyContent"
import { Button, Stack, Container } from "react-bootstrap"
import { ButtonHTMLAttributes, useEffect, useState } from "react"
import style from "./PolicyPage.module.css"
import Router from "next/router"

const policies = [
  "copyright",
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
      <h1>Terms of Service</h1>
      <span>
        <p className={style.subHeading}>Our Shared Values</p>
        <hr className={style.bottomBorder}></hr>
        <p className={style.subHeading2Underlined}>How we interact with each other determines what we can accomplish.</p>
        <p className={style.subHeading2}>On this website, we ask you to act with:</p>
        <p className={style.subHeading2Bold}>Compassion, Curiosity, and Humility</p>
      </span>


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
            style[policy === "copyright" ? "currentTab" : "tab"]
          }`}
          id="copyright"
          onClick={e => handleOnClick("copyright")}
        >
          Copyright <br />
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
