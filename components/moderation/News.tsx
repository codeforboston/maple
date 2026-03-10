import React, { useEffect } from "react"
import { collection, getFirestore, onSnapshot } from "firebase/firestore"
import {
  Create,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditButton,
  List,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  useRefresh
} from "react-admin"

const typeChoices = [
  { id: "article", name: "Article" },
  { id: "award", name: "Award" },
  { id: "book", name: "Book" }
]

export function ListNews() {
  const firestore = getFirestore()
  const refresh = useRefresh()

  useEffect(() => {
    const newsRef = collection(firestore, "news")
    const unsubscribe = onSnapshot(
      newsRef,
      () => refresh(),
      (e: Error) => console.log(e)
    )

    return () => unsubscribe()
  }, [firestore, refresh])

  return (
    <List>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="id" label="News ID" />
        <TextField source="title" label="Title" />
        <TextField source="author" label="Author" />
        <TextField source="type" label="Type" />
        <DateField source="publishDate" label="Publish Date" />
        <EditButton label="Edit" />
      </Datagrid>
    </List>
  )
}

export function EditNews() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="url" fullWidth />
        <SelectInput source="type" choices={typeChoices} />
        <TextInput source="author" />
        <TextInput source="title" fullWidth />
        <TextInput source="description" multiline fullWidth />
        <DateInput source="publishDate" />
      </SimpleForm>
    </Edit>
  )
}

export function CreateNews() {
  return (
    <Create transform={(data: Record<string, unknown>) => ({ ...data, createdAt: new Date() })}>
      <SimpleForm>
        <TextInput source="url" fullWidth />
        <SelectInput source="type" choices={typeChoices} />
        <TextInput source="author" />
        <TextInput source="title" fullWidth />
        <TextInput source="description" multiline fullWidth />
        <DateInput source="publishDate" />
      </SimpleForm>
    </Create>
  )
}

export default { ListNews, EditNews, CreateNews }
