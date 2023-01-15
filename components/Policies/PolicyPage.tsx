import { PolicyContent } from "./PolicyContent"
import { Button, Stack, Container } from "react-bootstrap"
import { ButtonHTMLAttributes, useState } from "react"

export default function PolicyPage() {
  const [policycontent, setpolicy] = useState<
    "terms-of-service" | "privacy-policy" | "code-of-conduct"
  >("privacy-policy")
  const handleOnClick = (e: any) => {
    setpolicy(e.target.id)
  }

  return (
    <Container>
      <h1>Policies</h1>
      <Stack direction="horizontal">
        <Button id="privacy-policy" onClick={handleOnClick}>
          Privacy Policy
        </Button>
        <Button id="terms-of-service" onClick={handleOnClick}>
          Terms of Service
        </Button>
        <Button id="code-of-conduct" onClick={handleOnClick}>
          Code of Conduct
        </Button>
      </Stack>

      <PolicyContent policy={policycontent} />
    </Container>
  )
}
