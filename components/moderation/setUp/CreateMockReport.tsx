import { ReportModal } from "components/TestimonyCard/ReportModal"
import { useReportTestimony } from "components/api/report"
import { useState } from "react"
import { useRecordContext } from "react-admin"
import { Testimony } from "../../db"

export const CreateMockReport = () => {
  const record = useRecordContext<Testimony>()
  const testimony = record
  const reportMutation = useReportTestimony()
  const [isReporting, setIsReporting] = useState(false)

  return isReporting ? (
    <ReportModal
      onClose={() => setIsReporting(false)}
      onReport={report => {
        reportMutation.mutate({ testimony, report })
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
    <button onClick={() => setIsReporting(true)}>generate report</button>
  )
}
