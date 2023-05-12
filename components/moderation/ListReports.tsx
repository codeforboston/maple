import {
  Button,
  Datagrid,
  EditButton,
  List,
  TextField,
  WithRecord
} from "react-admin"
import { Report } from "."
import { StatusField } from "./common"
import { CreateMockReport } from "./setUp/CreateMockReport"
import { auth } from "components/firebase"

export function ListReports() {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <CreateMockReport />
      </div>
      <List>
        <Datagrid rowClick={"edit"}>
          <TextField source="id" label="report id" />
          <TextField source="testimonyId" />
          <TextField
            source="resolution.archiveTestimonyId"
            label="archived id"
          />
          <TextField source="reason" />
          <StatusField label="status" />
          <TextField source="resolution.resolution" label="resolution" />
          <TextField source="resolution.moderatorUid" label="moderated by" />
          <WithRecord
            label="Resolve Report"
            render={(record: Report) => {
              const hasBeenResolved =
                record.resolution?.resolution !== undefined
              return hasBeenResolved ? (
                <div>resolved</div>
              ) : (
                <EditButton label="resolve report" disabled={hasBeenResolved} />
              )
            }}
          />
        </Datagrid>
      </List>
    </>
  )
}
