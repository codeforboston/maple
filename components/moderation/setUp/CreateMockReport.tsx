import { ReportModal } from "components/TestimonyCard/ReportModal"
import { useReportTestimony } from "components/api/report"
import { useAuth } from "components/auth"
import { Testimony } from "components/db"
import { auth, firestore } from "components/firebase"
import { createFakeTestimony } from "components/moderation"
import { doc, getDoc } from "firebase/firestore"
import { loremIpsum } from "lorem-ipsum"
import { nanoid } from "nanoid"
import { useState } from "react"
import { Button, useRefresh } from "react-admin"

export const CreateMockReport = () => {
  const [testimony, setTestimony] = useState<Testimony>()
  const reportMutation = useReportTestimony()
  const [isReporting, setIsReporting] = useState(false)
  const { authenticated, claims, user } = useAuth()
  const refresh = useRefresh()

  const token = auth.currentUser?.getIdToken()
  token?.then(d => {
    console.log("current user: ", authenticated, user, claims)
  })

  const onclick = async () => {
    console.log("CLICKING")

    const uid = nanoid(15).replace("/[^A-Za-z]/g", "A")
    console.log("uid", uid)
    const fullName = loremIpsum({ count: 2, units: "words" })
    const email = `${uid}@example.com`

    const result = await createFakeTestimony({
      uid,
      fullName,
      email
    })
    if (!result) throw new Error("result now found")
    const snap = getDoc(
      doc(
        firestore,
        `users/${result.data.uid}/publishedTestimony/${result.data.tid}`
      )
    )

    if (!(await snap).exists()) {
      throw new Error("snape does note exist")
    }

    snap.then(d => {
      setTestimony(d.data() as Testimony)
    })

    setIsReporting(true)
  }

  return isReporting ? (
    <ReportModal
      onClose={async () => {
        refresh()
        setTestimony(undefined)
        setIsReporting(false)
      }}
      onReport={report => {
        testimony && reportMutation.mutate({ report, testimony })
      }}
      isLoading={reportMutation.isLoading}
      reasons={[
        "Personal Information",
        "Offensive",
        "Violent",
        "Spam",
        "Phishing"
      ]}
    />
  ) : (
    <div
      style={{
        padding: "2em",
        display: "flex",
        placeContent: "center"
      }}
    >
      <Button
        sx={{ width: "max-content" }}
        onClick={onclick}
        label="seed with a fake report"
        variant="outlined"
      />
    </div>
  )
}
