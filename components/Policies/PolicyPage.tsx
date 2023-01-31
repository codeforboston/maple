import { PolicyContent } from "./PolicyContent"
import { Button, Stack, Container } from "react-bootstrap"
import { ButtonHTMLAttributes, useState } from "react"
import style from "./PolicyPage.module.css"

export default function PolicyPage() {
  const [policycontent, setpolicy] = useState<
    "terms-of-service" | "privacy-policy" | "code-of-conduct"
  >("privacy-policy")

  const [toggleCurrentTab, setToggleTab] = useState(1)

  const handleOnClick = (e: any, index: any) => {
    setToggleTab(index)
    setpolicy(e.target.id)
  }

  return (
    <Container className={style.policyContent}>
      <h1>Policies</h1>

      <Stack direction="horizontal">
        <Button
          className={`${style[toggleCurrentTab === 1 ? "currentTab" : "tab"]}`}
          id="privacy-policy"
          onClick={e => handleOnClick(e, 1)}
        >
          Privacy <br /> Policy
        </Button>
        <Button
          className={`${style[toggleCurrentTab === 2 ? "currentTab" : "tab"]}`}
          id="terms-of-service"
          onClick={e => handleOnClick(e, 2)}
        >
          Terms <br /> of Service
        </Button>
        <Button
          className={`${style[toggleCurrentTab === 3 ? "currentTab" : "tab"]}`}
          id="code-of-conduct"
          onClick={e => handleOnClick(e, 3)}
        >
          Code of <br /> Conduct
        </Button>
      </Stack>

      <PolicyContent policy={policycontent} />
    </Container>
  )
}
