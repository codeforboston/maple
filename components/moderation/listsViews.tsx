import _ from "lodash"
import { useCallback } from "react"
import {
  Button,
  ChipField,
  Datagrid,
  EditButton,
  FunctionField,
  List,
  ReferenceOneField,
  TextField,
  Toolbar,
  useListController,
  useNotify
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

const UserRoleToolBar = ({
  filterValues,
  setFilters
}: {
  filterValues: object
  setFilters: any
}) => {
  const toggleFilter = useCallback(() => {
    _.isEmpty(filterValues)
      ? setFilters({ userRole: "pendingUpgrade" }, [], true)
      : setFilters({}, [], true)
  }, [filterValues, setFilters])

  return (
    <Toolbar sx={{ width: "100%" }}>
      <Button
        label={_.isEmpty(filterValues) ? "View Requests" : "View All Profiles"}
        variant="outlined"
        onClick={toggleFilter}
      />
    </Toolbar>
  )
}

export function ListProfiles() {
  const notify = useNotify()

  const { filterValues, setFilters } = useListController()

  return (
    <List
      actions={
        <UserRoleToolBar filterValues={filterValues} setFilters={setFilters} />
      }
    >
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
        <EditButton />
      </Datagrid>
    </List>
  )
}
