import {
  Button,
  ChipField,
  Datagrid,
  EditButton,
  FunctionField,
  List,
  ReferenceOneField,
  TextField,
  TextInput,
  useNotify,
  useRedirect
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

export function ListProfiles() {
  const notify = useNotify()
  return (
    <List filter={{ userRole: "pendingUpgrade" }}>
      <Datagrid rowClick="show">
        <TextField source="id" />
        <TextField source="displayName" />
        <TextField source="fullName" />
        <TextField source="publicEmail" />
        <TextField source="publicPhone" />
        <TextField source="website" />
        <TextField source="orgCategory" label="category" />
        <TextField source="request" />
        <TextField source="userRole" />
        <Button label="upgrade" onClick={() => notify("user upgraded")} />
        <Button
          label="close request"
          onClick={() => notify("request closed")}
        />
        <EditButton />
      </Datagrid>
    </List>
  )
}
