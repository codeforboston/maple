import { Testimony } from "common/testimony/types"
import { ReportModal } from "components/TestimonyCard/ReportModal"
import { useReportTestimony } from "components/api/report"
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

  const onclick = async () => {
    await auth.currentUser?.getIdToken(true)

    const uid = nanoid(15).replace("/[^A-Za-z]-/g", "A")
    const fullName = loremIpsum({ count: 2, units: "words" })
    const email = `${uid}@example.com`

    const result = await createFakeTestimony({
      uid,
      fullName,
      email
    })
    if (!result) throw new Error("result not found")
    const d = await getDoc(
      doc(
        firestore,
        `users/${result.data.uid}/publishedTestimony/${result.data.tid}`
      )
    )

    setTestimony(d.data() as Testimony)

    setIsReporting(true)
  }

  return isReporting && testimony ? (
    <ReportModal
      onClose={async () => {
        setTestimony(undefined)
        setIsReporting(false)
      }}
      onReport={report => {
        try {
          reportMutation.mutate({ report, testimony })
        } catch (e) {
          console.log({ e })
        }
      }}
      isLoading={reportMutation.isLoading}
      additionalInformationLabel="Additional Information"
      reasons={[
        "Personal Information",
        "Wrong Bill",
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
