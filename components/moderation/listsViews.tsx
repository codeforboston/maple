import {
  ChipField,
  Datagrid,
  EditButton,
  FunctionField,
  Labeled,
  List,
  ReferenceOneField,
  TextField
} from "react-admin"
import { MemorableId, StatusField } from "./common"
import { Report } from "./types"

export function ListReports() {
  return (
    <List>
      <Datagrid rowClick={"show"}>
        <MemorableId label="Report Id" />
        <FunctionField
          label="Reported Date"
          render={(record: Report & { id: string }) => {
            const date = new Date(record.reportDate).toLocaleDateString()
            return <div>{date}</div>
          }}
        />
        <StatusField label="Status" />
        <TextField source="adminId" />
        <TextField source="resolution" />
        <EditButton />
      </Datagrid>
    </List>
  )
}

export function ListPublishedTestimony() {
  return (
    <List resource="publishedTestimony">
      <Datagrid>
        <TextField source="authorDisplayName" label="author" />
        <TextField source="billId" label="Bill" />
        <TextField source="content" />
        <ReferenceOneField reference="reports" target="testimonyId">
          <ChipField source="id" />
        </ReferenceOneField>
      </Datagrid>
    </List>
  )
}
