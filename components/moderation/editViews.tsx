import { Card, CardContent, CardHeader, Stack } from "@mui/material"
import { Testimony } from "components/db"
import { Timestamp } from "firebase/firestore"
import { nanoid } from "nanoid"
import {
  Button,
  Create,
  DateField,
  DateInput,
  Edit,
  Form,
  ReferenceInput,
  SelectInput,
  TextInput,
  useCreateController,
  useDataProvider,
  useEditController,
  WithRecord
} from "react-admin"
import { FieldValues } from "react-hook-form"
import {
  adminChoices,
  createMemIdString,
  LongText,
  MemorableId,
  reasonChoices,
  resolutionChoices,
  StatusField,
  TestimonyContent
} from "./common"
import { Report } from "./types"

export function EditReports() {
  const { isLoading, record, resource, data } = useEditController()
  const dp = useDataProvider()
  if (isLoading) return null

  const editSubmit = async (event: FieldValues) => {
    const params = { id: record.id, data: event, previousData: data }
    const res = await dp.update(resource, params)
  }

  return (
    <Edit>
      <Form onSubmit={editSubmit}>
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
          </Card>
          <Card>
            <CardHeader title="Response" />
            <CardContent>
              <SelectInput
                source="adminId"
                variant="outlined"
                choices={adminChoices}
              />
              <SelectInput
                source="resolution"
                variant="outlined"
                choices={resolutionChoices}
              />
              <LongText label="admin comment" source="adminComment" />
            </CardContent>
            <CardContent>{/* <TestimonyContent /> */}</CardContent>
          </Card>
        </Stack>
        <Button type="submit" label="submit" variant="outlined" />
      </Form>
    </Edit>
  )
}

// Temp for development
export const CreateReport = () => {
  const { resource } = useCreateController()
  const dp = useDataProvider()
  const editSubmit = async (event: FieldValues) => {
    const params = { data: { ...event, id: `${event.id}` } }
    // const params = { id: `${resource}/${event.id}`, data: { ...event, id: `${resource}/${event.id}` }}
    console.log(params, resource)
    const res = await dp.create(resource, params)
    console.log(res)
  }

  const reportId = `reports/${nanoid()}`
  const reportDate = new Timestamp(
    Math.round(Math.random() * 1_000_000_000),
    Math.round(Math.random() * 1_000_000_000)
  )
    .toDate()
    .toLocaleString()

  return (
    <Create>
      <Form onSubmit={editSubmit}>
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
                <TextInput
                  label="report Id"
                  variant="outlined"
                  source="id"
                  defaultValue={reportId}
                />
              </div>
              <DateInput
                source="reportDate"
                variant="outlined"
                parse={val => new Date(val).toLocaleDateString()}
                defaultValue={reportDate}
              />
            </CardContent>
            <CardContent>
              <ReferenceInput
                source="testimonyId"
                reference="publishedTestimony"
              >
                <SelectInput
                  optionText={(record: Testimony) => createMemIdString(record)}
                  variant="outlined"
                />
              </ReferenceInput>
              <SelectInput
                source="reason"
                variant="outlined"
                choices={reasonChoices}
              />
              <LongText
                label="additional information"
                source="additionalInformation"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Response" />
            <CardContent>
              <SelectInput
                source="adminId"
                variant="outlined"
                choices={adminChoices}
              />
              <SelectInput
                source="resolution"
                variant="outlined"
                choices={resolutionChoices}
              />
              <LongText label="comment" source="comment" />
            </CardContent>
          </Card>
        </Stack>
        <Button type="submit" label="submit" variant="outlined" />
      </Form>
    </Create>
  )
}
