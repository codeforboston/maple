import { useAuth } from "components/auth"
import { Button, Card, Col, Container } from "components/bootstrap"
import { FirebaseError } from "firebase/app"
import ErrorPage from "next/error"
import React, { useEffect, useState } from "react"
import { z } from "zod"
import { createAdmin } from "./types"

const email = z.string().email()
type Email = z.infer<typeof email>

function validateIsEmail(input: string): input is Email {
  return z.string().email().safeParse(input).success
}

function validateIsString(input: string): input is string {
  return z.string().safeParse(input).success
}

const upgradeToAdminByUidOrEmail = async (input: string) => {
  console.log("submitting " + input)

  try {
    await createAdmin({ input })
  } catch (e) {
    if (e instanceof FirebaseError) {
      throw new Error(`${e.code} ${e.message}`)
    }
    throw new Error("internal error")
  }
}

export default function AccountActions() {
  const { claims } = useAuth()

  if (claims?.role !== "admin") {
    return <ErrorPage statusCode={404} withDarkMode={false} />
  }

  return (
    <Container fluid>
      <Col>
        <SingleChangeRole
          executeChange={upgradeToAdminByUidOrEmail}
          validateInput={validateIsString}
          title={"Create Admin"}
          instruction={"Enter user uid"}
        />
      </Col>
      {/* 
      
      disabled until I decide how to fetch the user/orgs
      if we want to broaden modifyAccount to accept emails
      <Col>
        <ListChangeRoles
          executeChange={upgradeToOrgByEmails}
          validateInput={validateIsEmail}
          title="Upgrade to Org"
          instruction="Enter emails to upgrade to orgs"
        />
      </Col> */}
    </Container>
  )
}

type SingleChangeRoleProps = {
  title: string
  instruction: string
  validateInput: (input: string) => boolean
  executeChange: <T extends string>(input: T) => Promise<void>
}

function SingleChangeRole({
  title,
  instruction,
  validateInput,
  executeChange
}: SingleChangeRoleProps) {
  const [input, setInput] = useState<string>()
  const [msg, setMsg] = useState<string>()
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    setIsError(false)
    setMsg("")
  }, [])

  const onSubmit = (input: string) => {
    setMsg("submitting " + input)
    setIsError(false)
    setInput(input)
  }

  const clickHandler = async (e: React.MouseEvent) => {
    if (!input) return

    await executeChange(input)
      .then(d => {
        setIsError(false)
        setMsg("success")
      })
      .catch(e => {
        setIsError(true)
        if (e instanceof FirebaseError) {
          setMsg(e.code + " " + e.message)
        } else {
          setMsg((e as object).toString())
        }
      })
  }

  return (
    <Container className="d-flex align-content-top m-5">
      <Card className="col-7">
        <Card.Header>{title}</Card.Header>
        <Card.Body className="d-flex">
          <Card.Text className="m-2">{instruction}</Card.Text>
          <InputWithEnter validateInput={validateInput} submit={onSubmit} />
        </Card.Body>

        {input && <Card.Body>User: {input}</Card.Body>}

        {msg && <MsgBox msg={msg} error={isError} />}

        <Card.Body className="my-3 d-flex justify-content-center">
          <Button
            onClick={clickHandler}
            disabled={!input}
            className="bg-secondary"
          >
            Submit
          </Button>
        </Card.Body>
      </Card>
    </Container>
  )
}

type ListChangeRoleProps = {
  executeChange: <T extends string>(list: T[]) => Promise<void>
  validateInput: (input: string) => boolean
  title: string
  instruction: string
}

export function ListChangeRoles({
  executeChange,
  validateInput,
  title,
  instruction
}: ListChangeRoleProps) {
  const [list, setList] = useState<string[]>([])
  const [error, setError] = useState<string | undefined>()

  const onSubmit = (input: string) => setList([...list, input])
  const clickHandler = (e: React.MouseEvent) => {
    if (list.length === 0) return

    executeChange(list).catch(e => {
      if (e instanceof FirebaseError) {
        setError(e.message)
      } else {
        setError((e as object).toString())
      }
    })
  }
  return (
    <Container className="d-flex align-content-top m-5">
      <Card className="col-7">
        <Card.Header>{title}</Card.Header>
        <Card.Body className="d-flex">
          <Card.Text className="m-2">{instruction}</Card.Text>
          <InputWithEnter validateInput={validateInput} submit={onSubmit} />
        </Card.Body>
        {list && <Card.Body>Users: {list.toString()}</Card.Body>}
        {error && (
          <Card.Body className="border border-primary m-3 text-primary text-center">
            {error}
          </Card.Body>
        )}
        <Container className="my-3 d-flex justify-content-center">
          <Button
            type="button"
            className="bg-secondary"
            disabled={!list || list.length === 0}
            onClick={clickHandler}
          >
            Submit
          </Button>
        </Container>
      </Card>
    </Container>
  )
}

function MsgBox({ msg, error = true }: { msg: string; error: boolean }) {
  return (
    <Container>
      <Card.Body
        className={`my-3 d-flex justify-content-center ${
          error
            ? "border border-danger text-danger"
            : "border border-secondary text-secondary"
        }`}
      >
        {msg}
      </Card.Body>
    </Container>
  )
}

const upgradeToOrgByEmails = async (list: string[]) => {}

type InputWithEnterProps = {
  name?: string
  validateInput: (input: string) => boolean
  submit: <T extends string>(input: T) => void
} & React.InputHTMLAttributes<HTMLInputElement>

function InputWithEnter({
  name,
  validateInput,
  submit,
  ...rest
}: InputWithEnterProps) {
  const [input, setInput] = useState<string>("")
  const [error, setError] = useState<string>("")

  const onkeyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    setError("")
    if (e.key === "Enter") {
      if (input && validateInput(input)) {
        submit(input)
        setInput("")
      } else {
        setError("invalid input")
      }
    }
  }
  const oninput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const onclick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (input && validateInput(input)) {
      submit(input)
    }
    setInput("")
    setError("")
  }

  return (
    <Card.Body className="d-flex flex-column w-100">
      <div className="d-flex w-100">
        <input
          name={name}
          className="w-100 h-100"
          onKeyUp={onkeyup}
          onInput={oninput}
          {...rest}
          value={input}
        />
        <Button type="submit" className="bg-secondary" onClick={onclick}>
          Enter
        </Button>
      </div>
      <div className="flex text-danger">{error}</div>
    </Card.Body>
  )
}
