import {
  Datagrid,
  List,
  ShowButton,
  TextField
} from "react-admin"

export function ListPublishedTestimony() {
  return (
    <List resource="publishedTestimony">
      <Datagrid>
        <TextField source="authorUid" label="author" />
        <TextField source="billId" label="Bill" />
        <TextField source="id" label="Testimony Id" />
        <TextField source="content" />
      </Datagrid>
    </List>
  )
}

export function ListArchivedTestimony() {
  return (
    <List resource="archivedTestimony">
      <Datagrid>
        <TextField source="authorUid" label="author" />
        <TextField source="billId" label="Bill" />
        <TextField source="id" label="Testimony Id" />
        <TextField source="content" />
      </Datagrid>
    </List>
  )
}
