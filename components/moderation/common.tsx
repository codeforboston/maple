import { Testimony } from "components/db"
import {
  Labeled,
  RaRecord,
  useGetOne,
  useInput,
  useRecordContext
} from "react-admin"
import { Report } from "./types"

export const shortId = (record: Report & RaRecord) => {
  return record.reportId.slice(0, 8)
}

export const useTestimony = (testimonyId: string) => {
  const { data, isLoading } = useGetOne("publishedTestimony", {
    id: testimonyId
  })
  return isLoading ? data : null
}

export function TestimonyContent() {
  const record = useRecordContext<Report>()
  const { data, isLoading } = useGetOne("publishedTestimony", {
    id: record.testimonyId
  })
  if (isLoading) return null
  return <div>{data.content}</div>
}

export const MemorableId = ({ label }: { label?: string }) => {
  const record = useRecordContext<Report & RaRecord>()

  const { data, isLoading } = useGetOne("publishedTestimony", {
    id: record.testimonyId
  })

  if (isLoading) return null
  if (!data) return null

  return <div>{`${data.authorDisplayName}-${data.court}-${data.billId}`}</div>
}

export const createMemIdString = (record: Testimony & { id: string }) => {
  return `${record.authorDisplayName}-${record.court}-${record.billId}`
}
export const LongText = ({
  source,
  label
}: {
  source: string
  label: string
}) => {
  const { field, fieldState, formState, id, isRequired } = useInput({ source })
  return (
    <label htmlFor={id} style={{ width: "100%" }}>
      <div>{label}</div>
      <textarea
        id={id}
        {...field}
        style={{ width: "100%", height: "100px", whiteSpace: "pre-wrap" }}
      />
    </label>
  )
}

export const adminChoices = [
  { id: "Matt", name: "Matt" },
  { id: "Tom", name: "Tom" },
  { id: "Nathan", name: "Nathan" }
]

export const resolutionChoices = [
  { id: "removed", name: "removed" },
  { id: "allowed", name: "allowed" }
]

// reason will come from the report itself -- this is temp for dev
// TODO: remove
export const reasonChoices = [
  { id: "Personal Information", name: "Personal Information" },
  { id: "Offensive", name: "Offensive" },
  { id: "Violent", name: "Violent" },
  { id: "Spam", name: "Spam" },
  { id: "Phishing", name: "Phishing" }
]

export const StatusField = ({ label }: { label?: string }) => {
  const record = useRecordContext()

  const status =
    record.adminId === "" ||
    record.adminId === null ||
    record.adminId === undefined
      ? "new"
      : record.resolution === "allowed" || record.resolution === "removed"
      ? "resolved"
      : "pending"

  return <div>{status}</div>
}
