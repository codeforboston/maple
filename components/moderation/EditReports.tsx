import { Card, CardContent, CardHeader, Stack, Typography } from "@mui/material"
import { Testimony } from "components/db"
import {
  Edit,
  TextField,
  useEditController,
  useGetOne,
  useRefresh
} from "react-admin"
import { RemoveTestimonyForm } from "./RemoveTestimony"
import { Report } from "./types"

export function EditReports() {
  const { record, data } = useEditController<Report>()
  const refresh = useRefresh()

  const { data: testimony, isLoading } = useGetOne("publishedTestimony", {
    id: data?.testimonyId || record?.testimonyId || "12345678"
  })

  if (isLoading) return <div>loading...</div>
  if (!record) return <div>no record</div>

  return (
    <Edit>
      <Stack>
        <Card>
          <CardHeader title="Report" />
          <CardContent
            sx={{
              display: "flex",
              gap: "2em",
              alignItems: "flex-start"
            }}
          >
            <label>
              Reporter Id
              <div>
                <TextField source="reporterUid" label="reporter Id" />
              </div>
            </label>
            <label>
              Report Date
              <br />
              <div>
                {new Date(record?.reportDate?.toDate()).toLocaleDateString()}
              </div>
            </label>
            <label>
              Resolution
              {record?.resolution?.resolution ? (
                <div>
                  <TextField source="resolution.resolution" />
                </div>
              ) : (
                <div>pending</div>
              )}
            </label>
          </CardContent>
          <CardContent>
            <ReportContent testimony={testimony} report={record} />
          </CardContent>
          <CardContent>
            <RemoveTestimonyForm report={record} />
          </CardContent>
        </Card>
      </Stack>
    </Edit>
  )
}

export const ReportContent = ({
  testimony,
  report
}: {
  testimony: Testimony
  report: Report
}) => {
  return (
    <Card>
      <CardHeader title="User Report Content" />
      <CardContent>
        <TextField label="archive id" source="resolution.archiveTestimonyId" />

        <label>Reason:</label>
        <Typography>{report.reason}</Typography>
        <br />
        <label>Additional Information:</label>
        <Typography>
          {report.additionalInformation || "No additional information provided"}
        </Typography>
      </CardContent>
      <CardContent>
        <div>Testimony author uid: </div>
        <div>{testimony?.authorUid}</div>
        <br />
        <div>Text of Testimony: </div>
        <div>{testimony?.content}</div>
      </CardContent>
    </Card>
  )
}
