import { Card, CardContent, CardHeader, Stack } from "@mui/material"
import { deleteTestimony } from "components/api/delete-testimony"
import { resolveReport } from "components/db"
import { getAuth } from "firebase/auth"
import { Timestamp } from "firebase/firestore"
import { FormEventHandler, useState } from "react"
import { useRedirect, useNotify } from "react-admin"
import { Report, Resolution } from "."
import { Stack as stackbs } from "components/bootstrap"

export type ReportResponseValues = {
  reportId: string
  resolution: Resolution
  reason: string
}

export const onSubmitReport = async (
  reportId: string,
  resolution: Resolution,
  reason: string,
  authorUid: string,
  testimonyId: string
) => {
  // If removing testimony, call deleteTestimony to move testimony from 'published' to 'archived'
  const r = await resolveReport({
    reportId,
    resolution,
    reason
  })

  console.log(`${r.data.status}`)

  if (r.data.status !== `success`) {
    alert(r.data.status)
    return [`list`, `reports`]
  }

  if (resolution === "remove-testimony") {
    const res = await deleteTestimony(authorUid, testimonyId)
    if (res.status === 204) {
      alert(`${testimonyId} deleted`)
      return ["list", "reports"]
    } else {
      alert(
        `${res.status} ${res.statusText} ${res.data} did not delete testimony`
      )
    }
  }
}

export function RemoveTestimonyForm({ report }: { report: Report }) {
  const [resolution, setResolution] = useState<Resolution | undefined>(
    report.resolution?.resolution
  )
  const [reason, setReason] = useState<string | undefined>(
    report.resolution?.reason
  )
  const redirect = useRedirect()
  const auth = getAuth()

  const reportResolved = report.resolution?.resolution !== undefined

  const onSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault()
    if (resolution && reason && report.id) {
      console.log(report.id, resolution, reason)
      await onSubmitReport(
        report.id,
        resolution,
        reason,
        report.authorUid,
        report.testimonyId
      )
      redirect("list", "reports")
    } else {
      console.log("one of these not defined", resolution, reason, report.id)
    }
  }
  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader
          title={"Resolve Report"}
          subheader={`Report id: ${report.id}`}
        />
        {reportResolved && (
          <CardContent>
            <div>
              Resolved by:
              {auth?.currentUser?.email}
            </div>
            <div>
              Resolved on:{" "}
              {(report.resolution?.resolvedAt as Timestamp)
                .toDate()
                .toLocaleDateString()}
            </div>
          </CardContent>
        )}
        <CardContent
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-start"
          }}
        >
          <Stack
            flex={1}
            border={"1px solid lightgray"}
            borderRadius={"10px"}
            gap={1}
            padding={2}
            margin={1}
          >
            Resolution:
            <Stack direction={"column"}>
              <label htmlFor="resolveReportRemove">
                <input
                  disabled={reportResolved}
                  style={{ margin: "1em" }}
                  type="radio"
                  value="remove-testimony"
                  id="resolveReportRemove"
                  onChange={() => {
                    setResolution("remove-testimony")
                  }}
                  checked={resolution === "remove-testimony"}
                />
                Remove
              </label>
              <label htmlFor="resolveReportAllow">
                <input
                  disabled={reportResolved}
                  style={{ margin: "1em" }}
                  type="radio"
                  onChange={() => {
                    setResolution("allow-testimony")
                    console.log(resolution, reason)
                  }}
                  id="resolveReportAllow"
                  value="allow-testimony"
                  checked={resolution === "allow-testimony"}
                />
                Allow
              </label>
            </Stack>
          </Stack>

          <Stack
            flex={2}
            border={"1px solid lightgray"}
            borderRadius={"10px"}
            gap={1}
            padding={2}
            margin={1}
          >
            <label htmlFor="resolveReportComment">Reason:</label>
            <textarea
              disabled={reportResolved}
              style={{
                flex: "1"
              }}
              rows={3}
              required
              id="resolveReportComment"
              onChange={e => {
                setReason(e.target.value)
              }}
              value={reason}
            />
          </Stack>
        </CardContent>
        <CardContent>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              margin: "1em",
              flex: 0
            }}
          >
            <input
              style={{ margin: "auto" }}
              type="submit"
              disabled={reportResolved}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
