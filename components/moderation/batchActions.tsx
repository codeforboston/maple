import { useAuth } from "components/auth"
import { Button, Card, Col, Container, Table } from "components/bootstrap"
import { Profile, getProfile } from "components/db"
import { firestore } from "components/firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from "firebase/firestore"
import React, { useEffect, useState } from "react"
import { ZodError, z } from "zod"
import { createAdmin, modifyAccount } from "./types"
import { FirebaseError } from "firebase/app"
import ErrorPage from "next/error"

const email = z.string().email()
type Email = z.infer<typeof email>

function validateIsEmail(input: string): input is Email {
  return z.string().email().safeParse(input).success
}

const upgradeToAdminByEmail = async (email: Email) => {
  console.log("submitting " + email)

  let uid: string

  try {
    uid = await getUidFromEmail(email)
    await createAdmin({ uid })
  } catch (e) {
    throw new Error("user not found")
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
          executeChange={upgradeToAdminByEmail}
          validateInput={validateIsEmail}
          title={"Create Admin"}
          instruction={"Enter user email"}
        />
      </Col>
      <Col>
        <ListChangeRoles
          executeChange={upgradeToOrgByEmails}
          validateInput={validateIsEmail}
          title="Upgrade to Org"
          instruction="Enter emails to upgrade to orgs"
        />
      </Col>
    </Container>
  )
}

type SingleChangeRoleProps = {
  executeChange: <T extends string>(input: T) => Promise<void>
  validateInput: (input: string) => boolean
  title: string
  instruction: string
}

function SingleChangeRole({
  executeChange,
  validateInput,
  title,
  instruction
}: SingleChangeRoleProps) {
  const [input, setInput] = useState<string>()
  const [error, setError] = useState<string>()

  const onSubmit = (input: string) => {
    setInput(input)
    console.log("submitting " + input)
  }

  const clickHandler = async (e: React.MouseEvent) => {
    if (!input) {
      return
    }
    await executeChange(input)
      .then(d => d)
      .catch(e => {
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
        {input && <Card.Body>User: {input}</Card.Body>}
        {error && (
          <Card.Body className="border border-primary m-3 text-primary text-center">
            error: {error}
          </Card.Body>
        )}
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

const getUidFromEmail = async (email: string): Promise<string> => {
  const profilesRef = collection(firestore, "profiles")
  const q = query(profilesRef, where("email", "==", email))
  const querySnapShot = await getDocs(q)

  if (querySnapShot.size === 0) {
    throw Error("profile not found")
  }
  const uid = querySnapShot.docs[0].data().uid
  return uid
}

const getUidsFromEmail = async (list: string[]): Promise<string[]> => {
  const profilesRef = collection(firestore, "profiles")
  const q = query(profilesRef, where("email", "in", list))
  const querySnapShot = await getDocs(q)

  if (querySnapShot.size === 0) {
    throw Error("profile not found")
  }

  const uids = querySnapShot.docs.map(doc => {
    return doc.exists() ? doc.data().uid : null
  })

  return uids.filter(d => d !== null)
}

const upgradeToOrgByEmails = async (list: string[]) => {
  const uids = await getUidsFromEmail(list)
  uids.forEach(uid => {
    try {
      modifyAccount({ uid, role: "organization" })
    } catch (e) {
      console.log(e)
    }
  })
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

const getUserProfile = async (uid: string): Promise<Profile> => {
  const profilesRef = collection(firestore, "profiles")
  const profile = await getDoc(doc(profilesRef, uid))
  if (!profile.exists) {
    throw Error("profile not found")
  }
  return profile.data() as Profile
}

const getProfiles = async () => {
  const profilesRef = collection(firestore, "profiles")
  const snap = await getDocs(profilesRef)
  return snap.docs.map(d => d.data() as Profile)
}

const ShowUsers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    getProfiles().then(list => {
      setProfiles(list)
    })
  }, [])

  return (
    <Card>
      <Table>
        <thead>
          <tr>
            <th>fullname</th>
            <th>role</th>
            <th>info</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p, i) => (
            <tr key={i}>
              <td>{p.fullName}</td>
              <td>{p.role}</td>
              <td>{p.contactInfo?.publicEmail}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  )
}
