import { Card, CardContent, CardHeader, Stack } from "@mui/material"
import { deleteTestimony } from "components/api/delete-testimony"
import { resolveReport } from "components/db"
import { getAuth } from "firebase/auth"
import { Timestamp } from "functions/src/firebase"
import { FormEventHandler, useState } from "react"
import { useRedirect, useNotify, useRefresh } from "react-admin"
import { Report, Resolution } from "."


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
  publicationId: string,
  refresh: () => void
) => {
  const r = await resolveReport({
    reportId,
    resolution,
    reason
  })

  if (r.data.status !== `success`) {
    alert(r.data.status)
  }

  if (resolution === "remove-testimony") {
    // If removing testimony, call deleteTestimony to move testimony from 'published' to 'archived'
    await deleteTestimony(authorUid, publicationId)
  }
  refresh()
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
  const refresh = useRefresh()

  const reportResolved = report.resolution?.resolution !== undefined

  const onSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault()
    if (resolution && reason && report.id) {
      await onSubmitReport(
        report.id,
        resolution,
        reason,
        report.authorUid,
        report.testimonyId,
        refresh
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
