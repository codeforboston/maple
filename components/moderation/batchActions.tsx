import { Button, Card, Col, Container, Table } from "components/bootstrap"
import { Profile } from "components/db"
import { firestore } from "components/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import React, { useEffect, useState } from "react"
import { ZodError, z } from "zod"
import { modifyAccount } from "./types"


export default function AccountActions() {
  return (
    <Container fluid>
      <Col>
        <AdminUpgrader />
      </Col>
      <Col>
        <OrgUpgrader />
      </Col>
    </Container>
  )
}

function AdminUpgrader() {
  const [uid, setUid] = useState<string>()
  const [error, setError] = useState<string>()

  const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const { value } = e.currentTarget
      setUid(value)
      e.currentTarget.value = ""
    }
  }

  const handleClick = () => {
    if (!uid) {
      setError("uid not defined")
      return
    }

    modifyAccount({ uid, role: "admin" })
      .then(d => d)
      .catch(e => {
        if (e instanceof Error) {
          console.log(e.message)
        } else console.log(e)
      })
  }

  return (
    <Container className="d-flex align-content-top m-5">
      <Card className="col-4">
        <Card.Header>Grant Admin Access</Card.Header>
        <Card.Body className="d-flex">
          <Card.Text className="m-2">user uid</Card.Text>
          <input
            className="w-100 h-100"
            type="text"
            onChange={() => {
              setError("")
              setUid("")
            }}
            onKeyUp={handleInput}
          />
          <Button
            type="button"
            className="bg-secondary"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleInput}
          >
            enter
          </Button>
        </Card.Body>
        {uid && <Card.Body>User: {uid}</Card.Body>}
        {error && <Card.Body>error: {error}</Card.Body>}
        {/* {user && !error && ( */}
        <Card.Body className="my-3 d-flex justify-content-center">
          <Button onClick={handleClick} disabled={!uid}>
            Submit
          </Button>
        </Card.Body>
        {/* )} */}
      </Card>
    </Container>
  )
}

const getUidsFromEmail = async (list: string[]): Promise<string[]> => {
  const uids: string[] = []
  const profilesRef = collection(firestore, "profiles")
  const q = query(profilesRef, where("email", "in", list))
  ;(await getDocs(q)).forEach(snap => {
    if (snap.exists()) {
      uids.push(snap.data().uid)
    } else {
      throw Error("profile not found")
    }
  })
  return uids
}

export function OrgUpgrader() {
  const [emailList, setEmailList] = useState<string[]>([])
  const [error, setError] = useState<string | undefined>()
  const [msg, setMsg] = useState<string | undefined>()
  const [email, setEmail] = useState<string>()

  const handleUpgrade = async () => {
    try {
      const uids = await getUidsFromEmail(emailList)
      uids.forEach(uid => {
        modifyAccount({ uid, role: "organization" })
      })
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        console.log(e)
      }
    }
  }

  const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const { value } = e.currentTarget
      const emails = value.split("/,s?/g")
      const badEmails: string[] = []
      const goodEmails: string[] = []
      emails.forEach(e => {
        let validEmail: string
        try {
          z.string().email().safeParse(e)
          goodEmails.push(e)
        } catch (err) {
          badEmails.push(e)
          if (err instanceof ZodError) {
            console.log(err.message)
          }
          console.log(err)
        }
      })

      goodEmails.length > 0 && setMsg(goodEmails.toString())
      setEmailList(emails => [...emails, ...goodEmails])
      badEmails.length > 0 && setError(`bad emails: ${badEmails.toString()}`)
      e.currentTarget.value = ""
    }
  }

  return (
    <Container className="d-flex align-content-top m-5">
      <Card className="col-4">
        <Card.Header>Upgrade user to org</Card.Header>
        <Card.Body className="d-flex">
          <Card.Text className="m-2">user emails</Card.Text>
          <input
            className="w-100 h-100"
            onChange={() => {
              if (error) setError(undefined)
            }}
            onKeyUp={handleInput}
          />
          <Button
            type="button"
            className="bg-secondary"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleInput}
          >
            enter
          </Button>
        </Card.Body>
        {emailList && <Card.Body>{emailList.toString()}</Card.Body>}
        {error && <Card.Body>{error}</Card.Body>}
        <Container className="my-3 d-flex justify-content-center">
          <Button
            type="button"
            className="bg-secondary"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              handleUpgrade()
            }
          >
            Upgrade Users
          </Button>
        </Container>
      </Card>
    </Container>
  )
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
