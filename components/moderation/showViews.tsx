import { Card, CardContent, CardHeader, Stack } from "@mui/material"
import { DateField, Show, WithRecord } from "react-admin"
import { MemorableId, StatusField, TestimonyContent } from "./common"
import { Report } from "./types"

export const ShowReports = () => {
  return (
    <Show>
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
            <div>
              <label>
                Report Id
                <MemorableId />
              </label>
            </div>
            <label>
              Status
              <StatusField />
            </label>
            <label>
              Report Date
              <br />
              <DateField source="reportDate" />
            </label>
            <label>
              Moderator
              <WithRecord
                render={(record: Report) => <div>{record.adminId}</div>}
              />
            </label>
          </CardContent>
          <CardContent sx={{ display: "flex", gap: "2em" }}>
            <label>
              Reason:{" "}
              <WithRecord
                render={(record: Report) => {
                  return <div>{record.reason}</div>
                }}
              />
            </label>
            <WithRecord
              render={(record: Report) => {
                return (
                  <label>
                    Additional Information
                    <div>
                      {record.additionalInformation ??
                        "No additional information provided"}
                    </div>
                  </label>
                )
              }}
            />
          </CardContent>
          <CardContent sx={{ display: "flex", gap: "2em" }}>
            <label>
              Testimony Id <MemorableId />
            </label>
            <label>
              Testimony Content
              <TestimonyContent />
            </label>
          </CardContent>
          <CardContent sx={{ display: "flex", gap: "2em" }}>
            <label>
              Resolution
              <WithRecord
                render={(record: Report) => (
                  <div>{record.resolution ?? "not yet resolved"}</div>
                )}
              />
            </label>
            <label>
              Moderator Comment
              <WithRecord
                render={(record: Report) => (
                  <div>{record.adminComment ?? "no moderator comment"}</div>
                )}
              />
            </label>
          </CardContent>
        </Card>
      </Stack>
    </Show>
  )
}
